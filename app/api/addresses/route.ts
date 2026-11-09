import { NextRequest, NextResponse } from 'next/server'
import { addAddressToCustomer, type DeliveryCarrier } from '@/lib/db-customers'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { customerId, carrier, city, cityRef, branch, branchRef } = body

    if (!customerId || !carrier || !city || !branch) {
      return NextResponse.json(
        { error: 'Оберіть службу доставки (Нова Пошта або Укрпошта), місто та відділення.' },
        { status: 400 }
      )
    }

    const updatedCustomer = await addAddressToCustomer(String(customerId), {
      carrier: carrier as DeliveryCarrier,
      city: String(city),
      cityRef: cityRef ? String(cityRef) : undefined,
      branch: String(branch),
      branchRef: branchRef ? String(branchRef) : undefined,
    })

    if (!updatedCustomer) {
      return NextResponse.json(
        { error: 'Покупця не знайдено у базі даних. Увійдіть або зареєструйтеся.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ customer: updatedCustomer }, { status: 201 })
  } catch (err) {
    return NextResponse.json(
      { error: `Не вдалося додати адресу: ${(err as Error).message}` },
      { status: 500 }
    )
  }
}
