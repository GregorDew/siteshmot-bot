import { NextRequest, NextResponse } from 'next/server'
import {
  getCustomerById,
  saveOrderToDb,
  type CustomerAddress,
  type OrderItemRecord,
  type OrderRecord,
} from '@/lib/db-customers'
import { sendOrderToTelegramBot } from '@/lib/telegram-bot'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { customerId, customerSnapshot, address, items } = body as {
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

    if (!customerSnapshot || !customerSnapshot.firstName || !customerSnapshot.phone) {
      return NextResponse.json(
        { error: 'Необхідна реєстрація покупця перед оформленням замовлення.' },
        { status: 400 }
      )
    }

    if (!address || !address.city || !address.branch) {
      return NextResponse.json(
        { error: 'Оберіть адресу доставки (Нова Пошта або Укрпошта).' },
        { status: 400 }
      )
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Ваш кошик порожній.' }, { status: 400 })
    }

    const existingCustomer = customerId ? await getCustomerById(customerId) : null

    const totalPrice = items.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
      0
    )

    const orderId = `ORD-${Date.now().toString().slice(-6)}`
    const orderRecord: OrderRecord = {
      id: orderId,
      customerId: existingCustomer?.id || customerId || 'guest_registered',
      customerSnapshot: {
        firstName: existingCustomer?.firstName || customerSnapshot.firstName,
        lastName: existingCustomer?.lastName || customerSnapshot.lastName,
        phone: existingCustomer?.phone || customerSnapshot.phone,
        email: existingCustomer?.email || customerSnapshot.email,
        googleAccount:
          existingCustomer?.googleAccount || customerSnapshot.googleAccount,
      },
      address,
      items,
      totalPrice,
      telegramSent: false,
      createdAt: new Date().toISOString(),
    }

    const telegramResult = await sendOrderToTelegramBot(orderRecord)
    orderRecord.telegramSent = telegramResult.sent

    await saveOrderToDb(orderRecord)

    return NextResponse.json(
      {
        order: orderRecord,
        telegramStatus: telegramResult,
      },
      { status: 201 }
    )
  } catch (err) {
    return NextResponse.json(
      { error: `Помилка оформлення замовлення: ${(err as Error).message}` },
      { status: 500 }
    )
  }
}
