import {
  CATEGORY_LABELS,
  GENDER_LABELS,
  INITIAL_PRODUCTS,
  type ProductCategoryType,
  type ProductGender,
  type ProductRecord,
} from './lib/db-products'
import type {
  BotAdminRecord,
  CustomerAddress,
  CustomerRecord,
  DeliveryCarrier,
  OrderItemRecord,
  OrderRecord,
} from './lib/db-customers'
import { getBranchesForCity, searchCities } from './lib/shipping-directory'

interface Env {
  ASSETS: { fetch: (req: Request) => Promise<Response> }
  DB_CUSTOMERS?: D1Database
  DB_PRODUCTS?: D1Database
  TELEGRAM_BOT_TOKEN?: string
  TELEGRAM_ADMIN_USERNAME?: string
  NOVA_POSHTA_API_KEY?: string
}

interface D1Database {
  prepare: (query: string) => D1PreparedStatement
  batch: (statements: D1PreparedStatement[]) => Promise<unknown[]>
}

interface D1PreparedStatement {
  bind: (...values: unknown[]) => D1PreparedStatement
  all: <T = Record<string, unknown>>() => Promise<{ results: T[] }>
  first: <T = Record<string, unknown>>() => Promise<T | null>
  run: () => Promise<unknown>
}

const DEFAULT_BOT_TOKEN = ''

// Fallback in-memory stores if D1 hasn't been seeded yet
let memoryProducts: ProductRecord[] = [...INITIAL_PRODUCTS]
let memoryCustomers: CustomerRecord[] = []
let memoryOrders: OrderRecord[] = []
let memoryAdmins: BotAdminRecord[] = []

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

async function ensureProductsSeeded(db?: D1Database): Promise<ProductRecord[]> {
  if (!db) return memoryProducts
  try {
    const { results } = await db
      .prepare('SELECT * FROM products ORDER BY id DESC')
      .all<Record<string, unknown>>()

    if (!results || results.length === 0) {
      for (const p of INITIAL_PRODUCTS) {
        await db
          .prepare(
            `INSERT INTO products (name, price, description, material, category_type, gender, sizes_json, image, color, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          )
          .bind(
            p.name,
            p.price,
            p.description,
            p.material,
            p.categoryType,
            p.gender,
            JSON.stringify(p.sizes),
            p.image,
            p.color,
            p.createdAt
          )
          .run()
      }
      return INITIAL_PRODUCTS
    }

    return results.map((r) => ({
      id: Number(r.id),
      name: String(r.name),
      price: Number(r.price),
      description: String(r.description),
      material: String(r.material),
      categoryType: String(r.category_type) as ProductCategoryType,
      gender: String(r.gender) as ProductGender,
      sizes: JSON.parse(String(r.sizes_json || '["One Size"]')),
      image: String(r.image),
      color: String(r.color || 'bg-[#e8eef0]'),
      createdAt: String(r.created_at),
    }))
  } catch {
    return memoryProducts
  }
}

async function loadAllCustomersFromD1(db?: D1Database): Promise<CustomerRecord[]> {
  if (!db) return memoryCustomers
  try {
    const { results: custRows } = await db
      .prepare('SELECT * FROM customers ORDER BY created_at DESC')
      .all<Record<string, unknown>>()
    const { results: addrRows } = await db
      .prepare('SELECT * FROM customer_addresses ORDER BY created_at ASC')
      .all<Record<string, unknown>>()

    return (custRows || []).map((c) => {
      const cid = String(c.id)
      const addresses: CustomerAddress[] = (addrRows || [])
        .filter((a) => String(a.customer_id) === cid)
        .map((a) => ({
          id: String(a.id),
          customerId: cid,
          carrier: String(a.carrier) as DeliveryCarrier,
          city: String(a.city),
          cityRef: a.city_ref ? String(a.city_ref) : undefined,
          branch: String(a.branch),
          branchRef: a.branch_ref ? String(a.branch_ref) : undefined,
          isDefault: Boolean(a.is_default),
          createdAt: String(a.created_at),
        }))

      return {
        id: cid,
        firstName: String(c.first_name),
        lastName: String(c.last_name),
        phone: String(c.phone),
        email: String(c.email),
        googleAccount: c.google_email ? String(c.google_email) : undefined,
        googleId: c.google_id ? String(c.google_id) : undefined,
        addresses,
        createdAt: String(c.created_at),
      }
    })
  } catch {
    return memoryCustomers
  }
}

async function syncTelegramAdmins(
  token: string,
  db?: D1Database,
  adminUsernameFilter?: string
): Promise<BotAdminRecord[]> {
  const filter = adminUsernameFilter?.replace(/^@/, '').trim().toLowerCase()

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/getUpdates?limit=100`
    )
    const data = (await res.json()) as {
      ok?: boolean
      result?: Array<Record<string, any>>
    }
    if (data?.ok && Array.isArray(data.result)) {
      for (const upd of data.result) {
        const msg =
          upd.message || upd.edited_message || upd.callback_query?.message
        const from =
          upd.message?.from ||
          upd.edited_message?.from ||
          upd.callback_query?.from
        const chat = msg?.chat
        if (chat?.id) {
          const uname = String(from?.username || chat?.username || '').toLowerCase()
          if (!filter || uname === filter) {
            const chatId = String(chat.id)
            const username = from?.username || chat?.username || ''
            const firstName =
              from?.first_name || chat?.first_name || 'Адміністратор'
            const now = new Date().toISOString()

            if (!memoryAdmins.find((a) => a.chatId === chatId)) {
              memoryAdmins.push({ chatId, username, firstName, registeredAt: now })
            }
            if (db) {
              try {
                await db
                  .prepare(
                    `INSERT OR REPLACE INTO bot_admins (chat_id, username, first_name, registered_at)
                     VALUES (?, ?, ?, ?)`
                  )
                  .bind(chatId, username, firstName, now)
                  .run()
              } catch {}
            }
          }
        }
      }
    }
  } catch {}

  if (db) {
    try {
      const { results } = await db
        .prepare('SELECT * FROM bot_admins')
        .all<Record<string, unknown>>()
      if (results && results.length > 0) {
        return results.map((r) => ({
          chatId: String(r.chat_id),
          username: r.username ? String(r.username) : undefined,
          firstName: r.first_name ? String(r.first_name) : undefined,
          registeredAt: String(r.registered_at),
        }))
      }
    } catch {}
  }

  return memoryAdmins
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const path = url.pathname

    if (request.method === 'OPTIONS') {
      return json({ ok: true })
    }

    const botToken = env.TELEGRAM_BOT_TOKEN || DEFAULT_BOT_TOKEN

    // 1. /api/products (База даних №2: Товари)
    if (path === '/api/products') {
      if (request.method === 'GET') {
        const products = await ensureProductsSeeded(env.DB_PRODUCTS)
        return json({ products })
      }

      if (request.method === 'POST') {
        const body = (await request.json()) as Record<string, any>
        const {
          name,
          price,
          description,
          material,
          categoryType,
          gender,
          sizes,
          image,
          color,
        } = body
        if (!name || price === undefined || !description || !material) {
          return json({ error: 'Заповніть усі обов’язкові поля товару.' }, 400)
        }
        const parsedSizes =
          Array.isArray(sizes) && sizes.length > 0 ? sizes.map(String) : ['One Size']
        const now = new Date().toISOString()
        const img =
          image ||
          'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=85'
        const col = color || 'bg-[#e8eef0]'

        if (env.DB_PRODUCTS) {
          try {
            await env.DB_PRODUCTS.prepare(
              `INSERT INTO products (name, price, description, material, category_type, gender, sizes_json, image, color, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
            )
              .bind(
                String(name),
                Number(price),
                String(description),
                String(material),
                String(categoryType),
                String(gender),
                JSON.stringify(parsedSizes),
                img,
                col,
                now
              )
              .run()
          } catch {}
        }

        const newProd: ProductRecord = {
          id: Date.now(),
          name: String(name),
          price: Number(price),
          description: String(description),
          material: String(material),
          categoryType: categoryType as ProductCategoryType,
          gender: gender as ProductGender,
          sizes: parsedSizes,
          image: img,
          color: col,
          createdAt: now,
        }
        memoryProducts = [newProd, ...memoryProducts]
        return json({ product: newProd }, 201)
      }

      if (request.method === 'DELETE') {
        const id = Number(url.searchParams.get('id'))
        if (env.DB_PRODUCTS && id) {
          try {
            await env.DB_PRODUCTS.prepare('DELETE FROM products WHERE id = ?')
              .bind(id)
              .run()
          } catch {}
        }
        memoryProducts = memoryProducts.filter((p) => p.id !== id)
        return json({ deleted: true })
      }
    }

    // 2. /api/shipping (Усі адреси Нової Пошти та Укрпошти)
    if (path === '/api/shipping' && request.method === 'GET') {
      const type = url.searchParams.get('type') || 'cities'
      const query = url.searchParams.get('q') || ''
      const carrier = (url.searchParams.get('carrier') ||
        'nova_poshta') as DeliveryCarrier
      const city = url.searchParams.get('city') || ''
      const cityRef = url.searchParams.get('cityRef') || undefined

      if (type === 'branches') {
        if (!city) return json({ branches: [] })
        const branches = await getBranchesForCity(carrier, city, cityRef, query)
        return json({ branches })
      }
      const cities = await searchCities(query)
      return json({ cities })
    }

    // 3. /api/auth (База даних №1: Покупці — Реєстрація та Вхід)
    if (path === '/api/auth') {
      if (request.method === 'GET') {
        const customers = await loadAllCustomersFromD1(env.DB_CUSTOMERS)
        return json({ customers, orders: memoryOrders })
      }

      if (request.method === 'POST') {
        const body = (await request.json()) as Record<string, any>
        const {
          action,
          firstName,
          lastName,
          phone,
          email,
          googleAccount,
          carrier,
          city,
          cityRef,
          branch,
        } = body

        const allCustomers = await loadAllCustomersFromD1(env.DB_CUSTOMERS)

        if (action === 'login') {
          const normEmail = String(email || '').trim().toLowerCase()
          const normPhone = String(phone || '').replace(/\s+/g, '')
          const found = allCustomers.find(
            (c) =>
              c.email.toLowerCase() === normEmail ||
              (normPhone && c.phone.replace(/\s+/g, '') === normPhone)
          )
          if (!found) {
            return json(
              { error: 'Користувача не знайдено. Будь ласка, зареєструйтеся.' },
              404
            )
          }
          return json({ customer: found })
        }

        if (!firstName || !lastName || !phone || !email) {
          return json(
            {
              error:
                "Будь ласка, заповніть Ім'я, Прізвище, Телефон та Електронну пошту.",
            },
            400
          )
        }

        const normEmail = String(email).trim().toLowerCase()
        const now = new Date().toISOString()
        const existing = allCustomers.find(
          (c) => c.email.toLowerCase() === normEmail
        )
        const customerId =
          existing?.id ||
          `cust_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

        const addresses: CustomerAddress[] = existing ? [...existing.addresses] : []

        if (city && branch) {
          const addrId = `addr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
          const newAddr: CustomerAddress = {
            id: addrId,
            customerId,
            carrier: (carrier || 'nova_poshta') as DeliveryCarrier,
            city: String(city),
            cityRef: cityRef ? String(cityRef) : undefined,
            branch: String(branch),
            isDefault: true,
            createdAt: now,
          }
          addresses.forEach((a) => (a.isDefault = false))
          addresses.push(newAddr)

          if (env.DB_CUSTOMERS) {
            try {
              await env.DB_CUSTOMERS.prepare(
                `INSERT OR REPLACE INTO customers (id, first_name, last_name, phone, email, google_email, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`
              )
                .bind(
                  customerId,
                  String(firstName).trim(),
                  String(lastName).trim(),
                  String(phone).trim(),
                  normEmail,
                  googleAccount ? String(googleAccount).trim() : null,
                  now
                )
                .run()

              await env.DB_CUSTOMERS.prepare(
                `INSERT INTO customer_addresses (id, customer_id, carrier, city, city_ref, branch, is_default, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, 1, ?)`
              )
                .bind(
                  addrId,
                  customerId,
                  newAddr.carrier,
                  newAddr.city,
                  newAddr.cityRef || null,
                  newAddr.branch,
                  now
                )
                .run()
            } catch {}
          }
        }

        const customerRecord: CustomerRecord = {
          id: customerId,
          firstName: String(firstName).trim(),
          lastName: String(lastName).trim(),
          phone: String(phone).trim(),
          email: normEmail,
          googleAccount: googleAccount ? String(googleAccount).trim() : undefined,
          addresses,
          createdAt: now,
        }

        memoryCustomers = [
          customerRecord,
          ...memoryCustomers.filter((c) => c.id !== customerId),
        ]

        return json({ customer: customerRecord }, 201)
      }
    }

    // 4. /api/addresses (Кнопка «Додати іншу адресу» в кошику)
    if (path === '/api/addresses' && request.method === 'POST') {
      const body = (await request.json()) as Record<string, any>
      const { customerId, carrier, city, cityRef, branch } = body
      if (!customerId || !carrier || !city || !branch) {
        return json({ error: 'Оберіть службу доставки, місто та відділення.' }, 400)
      }

      const addrId = `addr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
      const now = new Date().toISOString()

      if (env.DB_CUSTOMERS) {
        try {
          await env.DB_CUSTOMERS.prepare(
            `INSERT INTO customer_addresses (id, customer_id, carrier, city, city_ref, branch, is_default, created_at)
             VALUES (?, ?, ?, ?, ?, ?, 1, ?)`
          )
            .bind(
              addrId,
              String(customerId),
              String(carrier),
              String(city),
              cityRef ? String(cityRef) : null,
              String(branch),
              now
            )
            .run()
        } catch {}
      }

      const allCustomers = await loadAllCustomersFromD1(env.DB_CUSTOMERS)
      let customer = allCustomers.find((c) => c.id === String(customerId))
      if (!customer) {
        customer = memoryCustomers.find((c) => c.id === String(customerId))
      }
      if (customer) {
        if (!customer.addresses.find((a) => a.id === addrId)) {
          customer.addresses.push({
            id: addrId,
            customerId: customer.id,
            carrier: carrier as DeliveryCarrier,
            city: String(city),
            cityRef: cityRef ? String(cityRef) : undefined,
            branch: String(branch),
            isDefault: true,
            createdAt: now,
          })
        }
        return json({ customer }, 201)
      }
      return json({ error: 'Покупця не знайдено' }, 404)
    }

    // 5. /api/checkout (Кнопка «Купити» -> Відправка замовлення адміну в Telegram-бот)
    if (path === '/api/checkout' && request.method === 'POST') {
      const body = (await request.json()) as {
        customerId: string
        customerSnapshot: {
          firstName: string
          lastName: string
          phone: string
          email: string
          googleAccount?: string
        }
        address: CustomerAddress
        items: OrderItemRecord[]
      }

      const { customerId, customerSnapshot, address, items } = body
      if (!customerSnapshot?.firstName || !address?.city || !items?.length) {
        return json({ error: 'Заповніть дані покупця, адресу та кошик.' }, 400)
      }

      const totalPrice = items.reduce(
        (sum, item) => sum + Number(item.price) * Number(item.quantity),
        0
      )
      const orderId = `ORD-${Date.now().toString().slice(-6)}`
      const now = new Date().toISOString()

      const orderRecord: OrderRecord = {
        id: orderId,
        customerId: customerId || 'registered',
        customerSnapshot,
        address,
        items,
        totalPrice,
        telegramSent: false,
        createdAt: now,
      }

      const carrierLabel =
        address.carrier === 'nova_poshta' ? '📦 Нова Пошта' : '📮 Укрпошта'

      const itemsLines = items
        .map(
          (item, index) =>
            `${index + 1}. <b>${escapeHtml(item.name)}</b>\n` +
            `   • Вид: ${escapeHtml(item.categoryType)} | Стать: ${escapeHtml(item.gender)}\n` +
            `   • Матеріал: ${escapeHtml(item.material)}\n` +
            `   • Розмір: <b>${escapeHtml(item.size)}</b>\n` +
            `   • Кількість: ${item.quantity} шт. × ${item.price} грн = <b>${item.quantity * item.price} грн</b>`
        )
        .join('\n\n')

      const messageText =
        `🛍 <b>НОВЕ ЗАМОВЛЕННЯ #${escapeHtml(orderRecord.id)}</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `👤 <b>ХТО ЗАМОВИВ (Покупець):</b>\n` +
        `• Ім'я та Прізвище: <b>${escapeHtml(customerSnapshot.firstName)} ${escapeHtml(customerSnapshot.lastName)}</b>\n` +
        `• Телефон: <code>${escapeHtml(customerSnapshot.phone)}</code>\n` +
        `• Email: ${escapeHtml(customerSnapshot.email)}\n` +
        (customerSnapshot.googleAccount
          ? `• Google-акаунт: ${escapeHtml(customerSnapshot.googleAccount)}\n`
          : '') +
        `\n🚚 <b>КУДИ ДОСТАВЛЯТИ:</b>\n` +
        `• Служба: <b>${carrierLabel}</b>\n` +
        `• Місто: <b>${escapeHtml(address.city)}</b>\n` +
        `• Відділення: <b>${escapeHtml(address.branch)}</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `👕 <b>ЩО ЗАМОВИЛИ (Товари з кошика):</b>\n\n` +
        `${itemsLines}\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `💰 <b>ЗАГАЛЬНА СУМА: ${totalPrice} грн</b>\n` +
        `🕒 Час: ${new Date(now).toLocaleString('uk-UA')}`

      const admins = await syncTelegramAdmins(
        botToken,
        env.DB_CUSTOMERS,
        env.TELEGRAM_ADMIN_USERNAME
      )

      let sentCount = 0
      for (const admin of admins) {
        try {
          const tgRes = await fetch(
            `https://api.telegram.org/bot${botToken}/sendMessage`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: admin.chatId,
                text: messageText,
                parse_mode: 'HTML',
              }),
            }
          )
          const tgData = (await tgRes.json()) as { ok?: boolean }
          if (tgData?.ok) sentCount++
        } catch {}
      }

      orderRecord.telegramSent = sentCount > 0
      memoryOrders.unshift(orderRecord)

      if (env.DB_CUSTOMERS) {
        try {
          await env.DB_CUSTOMERS.prepare(
            `INSERT INTO orders (id, customer_id, address_id, items_json, total_price, telegram_sent, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)`
          )
            .bind(
              orderId,
              orderRecord.customerId,
              address.id || 'addr',
              JSON.stringify(items),
              totalPrice,
              sentCount > 0 ? 1 : 0,
              now
            )
            .run()
        } catch {}
      }

      return json(
        {
          order: orderRecord,
          telegramStatus: {
            sent: sentCount > 0,
            details:
              sentCount > 0
                ? 'Інформацію про те, хто і що замовив, успішно надіслано адміну в Telegram!'
                : 'Замовлення збережено! Щоб бот надсилав вам повідомлення, відкрийте бота в Telegram і натисніть /start.',
          },
        },
        201
      )
    }

    // 6. /api/telegram (Webhook Telegram-бота для автоматичної реєстрації адміна по /start)
    if (path === '/api/telegram') {
      if (request.method === 'POST') {
        const update = (await request.json()) as Record<string, any>
        const msg = update?.message || update?.edited_message
        if (msg?.chat?.id) {
          const chatId = String(msg.chat.id)
          const username = msg.from?.username || msg.chat?.username || ''
          const firstName = msg.from?.first_name || msg.chat?.first_name || 'Адмін'
          const now = new Date().toISOString()

          if (!memoryAdmins.find((a) => a.chatId === chatId)) {
            memoryAdmins.push({ chatId, username, firstName, registeredAt: now })
          }

          if (env.DB_CUSTOMERS) {
            try {
              await env.DB_CUSTOMERS.prepare(
                `INSERT OR REPLACE INTO bot_admins (chat_id, username, first_name, registered_at)
                 VALUES (?, ?, ?, ?)`
              )
                .bind(chatId, username, firstName, now)
                .run()
            } catch {}
          }

          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              parse_mode: 'HTML',
              text:
                `✅ <b>Вітаємо, ${escapeHtml(firstName)}! Ви підключені як Адміністратор магазину mellow.</b>\n\n` +
                `Тепер щоразу, коли покупець на сайті натискає «Купити», я автоматично надсилатиму вам сюди повну інформацію: хто замовив, телефон, пошту, відділення Нової Пошти / Укрпошти та перелік куплених товарів із кошика!`,
            }),
          })
        }
        return json({ ok: true })
      }
      const admins = await syncTelegramAdmins(botToken, env.DB_CUSTOMERS)
      return json({ admins })
    }

    // Статичні файли вітрини Next.js
    return env.ASSETS.fetch(request)
  },
}
