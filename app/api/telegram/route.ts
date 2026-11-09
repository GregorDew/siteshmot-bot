import { NextRequest, NextResponse } from 'next/server'
import { getAllOrders, getBotAdmins, saveBotAdmin } from '@/lib/db-customers'

/**
 * Webhook-маршрут для Telegram-бота: коли адмін пише боту /start або /orders,
 * бот автоматично запам'ятовує його (без вводу chat_id) та відповідає.
 */
export async function POST(req: NextRequest) {
  try {
    const update = await req.json()
    const token = process.env.TELEGRAM_BOT_TOKEN
    const adminUsernameFilter = process.env.TELEGRAM_ADMIN_USERNAME
      ?.replace(/^@/, '')
      .trim()
      .toLowerCase()

    const msg = update?.message || update?.edited_message
    if (!msg?.chat?.id) {
      return NextResponse.json({ ok: true })
    }

    const chatId = String(msg.chat.id)
    const username = (msg.from?.username || msg.chat?.username || '').toLowerCase()
    const firstName = msg.from?.first_name || msg.chat?.first_name || 'Адмін'
    const text = (msg.text || '').trim()

    if (adminUsernameFilter && username !== adminUsernameFilter) {
      if (token) {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: '⛔ Доступ лише для адміністратора магазину.',
          }),
        })
      }
      return NextResponse.json({ ok: true })
    }

    await saveBotAdmin({
      chatId,
      username: msg.from?.username || msg.chat?.username,
      firstName,
    })

    if (token) {
      if (text.startsWith('/orders')) {
        const orders = await getAllOrders()
        const summary =
          orders.length === 0
            ? 'Поки що замовлень немає.'
            : orders
                .slice(0, 5)
                .map(
                  (o) =>
                    `• <b>#${o.id}</b> — ${o.customerSnapshot.firstName} ${o.customerSnapshot.lastName} (${o.customerSnapshot.phone}) — <b>${o.totalPrice} грн</b>`
                )
                .join('\n')

        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            parse_mode: 'HTML',
            text: `📋 <b>Останні замовлення магазину:</b>\n\n${summary}`,
          }),
        })
      } else {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            parse_mode: 'HTML',
            text:
              `✅ <b>Вітаємо, ${firstName}! Ви підключені як Адміністратор магазину mellow.</b>\n\n` +
              `Тепер щоразу, коли покупець на сайті натискає «Купити», я автоматично надсилатиму вам сюди повну інформацію: хто замовив, контакти, відділення Нової Пошти / Укрпошти та перелік куплених товарів.`,
          }),
        })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    )
  }
}

export async function GET() {
  const admins = await getBotAdmins()
  return NextResponse.json({ admins })
}
