import {
  getBotAdmins,
  saveBotAdmin,
  type BotAdminRecord,
  type OrderRecord,
} from './db-customers'

/**
 * Автоматично знаходить адмінів, які написали боту /start або будь-яке повідомлення
 * через getUpdates (тому вводити TELEGRAM_CHAT_ID вручну НЕ потрібно).
 */
export async function syncTelegramBotAdmins(
  token: string
): Promise<BotAdminRecord[]> {
  const adminUsernameFilter = process.env.TELEGRAM_ADMIN_USERNAME
    ?.replace(/^@/, '')
    .trim()
    .toLowerCase()

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/getUpdates?limit=100`,
      { method: 'GET', cache: 'no-store' }
    )
    const data = await res.json()

    if (data?.ok && Array.isArray(data.result)) {
      for (const update of data.result) {
        const msg =
          update.message ||
          update.edited_message ||
          update.callback_query?.message
        const from =
          update.message?.from ||
          update.edited_message?.from ||
          update.callback_query?.from
        const chat = msg?.chat

        if (chat?.id) {
          const username = (from?.username || chat?.username || '').toLowerCase()
          // Якщо заданий конкретний @username адміна — реєструємо тільки його, інакше всіх, хто запустив бота (/start)
          if (!adminUsernameFilter || username === adminUsernameFilter) {
            await saveBotAdmin({
              chatId: String(chat.id),
              username: from?.username || chat?.username,
              firstName: from?.first_name || chat?.first_name || 'Адміністратор',
            })
          }
        }
      }
    }
  } catch {
    // Якщо на боті вже стоїть webhook, getUpdates пропускається, а адміни вже збережені через webhook
  }

  return getBotAdmins()
}

export async function sendOrderToTelegramBot(order: OrderRecord): Promise<{
  sent: boolean
  details: string
}> {
  const token = process.env.TELEGRAM_BOT_TOKEN

  const carrierLabel =
    order.address.carrier === 'nova_poshta' ? '📦 Нова Пошта' : '📮 Укрпошта'

  const itemsLines = order.items
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
    `🛍 <b>НОВЕ ЗАМОВЛЕННЯ #${escapeHtml(order.id)}</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `👤 <b>ХТО ЗАМОВИВ (Покупець):</b>\n` +
    `• Ім'я та Прізвище: <b>${escapeHtml(order.customerSnapshot.firstName)} ${escapeHtml(order.customerSnapshot.lastName)}</b>\n` +
    `• Телефон: <code>${escapeHtml(order.customerSnapshot.phone)}</code>\n` +
    `• Email: ${escapeHtml(order.customerSnapshot.email)}\n` +
    (order.customerSnapshot.googleAccount
      ? `• Google-акаунт: ${escapeHtml(order.customerSnapshot.googleAccount)}\n`
      : '') +
    `\n🚚 <b>КУДИ ДОСТАВЛЯТИ:</b>\n` +
    `• Служба: <b>${carrierLabel}</b>\n` +
    `• Місто: <b>${escapeHtml(order.address.city)}</b>\n` +
    `• Відділення: <b>${escapeHtml(order.address.branch)}</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `👕 <b>ЩО ЗАМОВИЛИ (Товари з кошика):</b>\n\n` +
    `${itemsLines}\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `💰 <b>ЗАГАЛЬНА СУМА: ${order.totalPrice} грн</b>\n` +
    `🕒 Час: ${new Date(order.createdAt).toLocaleString('uk-UA')}`

  if (!token) {
    console.log('\n================ [TELEGRAM BOT NOTIFICATION PREVIEW] ================')
    console.log(messageText.replace(/<[^>]+>/g, ''))
    console.log('=====================================================================\n')
    return {
      sent: false,
      details:
        'Замовлення збережено! (Вкажіть TELEGRAM_BOT_TOKEN у .env і натисніть /start у боті, щоб бот автоматично надсилав замовлення адміну)',
    }
  }

  // Автоматично визначаємо адміна(ів), які натиснули /start у боті (без потреби вказувати chat_id)
  const admins = await syncTelegramBotAdmins(token)

  if (admins.length === 0) {
    return {
      sent: false,
      details:
        'Токен бота підключено, але жоден адмін ще не запустив бота. Просто відкрийте вашого бота в Telegram і натисніть /start — бот автоматично запам’ятає вас як адміна!',
    }
  }

  let sentCount = 0
  let lastError = ''

  for (const admin of admins) {
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${token}/sendMessage`,
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
      const result = await response.json()
      if (response.ok && result.ok) {
        sentCount++
      } else {
        lastError = result.description || response.statusText
      }
    } catch (err) {
      lastError = (err as Error).message
    }
  }

  if (sentCount > 0) {
    return {
      sent: true,
      details: `Інформацію про те, хто і що замовив, успішно надіслано адміну в Telegram!`,
    }
  }

  return {
    sent: false,
    details: `Не вдалося доставити повідомлення адміну: ${lastError}`,
  }
}

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
