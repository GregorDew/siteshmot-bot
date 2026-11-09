import { NextRequest, NextResponse } from 'next/server'
import {
  getAllCustomers,
  getAllOrders,
  getCustomerByEmailOrPhone,
  registerOrUpdateCustomer,
  type DeliveryCarrier,
} from '@/lib/db-customers'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')
  const mode = searchParams.get('mode')

  if (mode === 'admin') {
    const [customers, orders] = await Promise.all([getAllCustomers(), getAllOrders()])
    return NextResponse.json({ customers, orders })
  }

  if (email) {
    const customer = await getCustomerByEmailOrPhone(email)
    return NextResponse.json({ customer })
  }

  const customers = await getAllCustomers()
  return NextResponse.json({ customers })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      action,
      firstName,
      lastName,
      phone,
      email,
      googleAccount,
      googleId,
      password,
      carrier,
      city,
      cityRef,
      branch,
      branchRef,
    } = body

    if (action === 'login') {
      if (!email && !phone) {
        return NextResponse.json(
          { error: 'Введіть Email або номер телефону для входу.' },
          { status: 400 }
        )
      }
      const existing = await getCustomerByEmailOrPhone(email || '', phone || '')
      if (!existing) {
        return NextResponse.json(
          { error: 'Користувача з такими даними не знайдено. Будь ласка, зареєструйтеся.' },
          { status: 404 }
        )
      }
      return NextResponse.json({ customer: existing })
    }

    if (!firstName || !lastName || !phone || !email) {
      return NextResponse.json(
        {
          error:
            "Будь ласка, заповніть Ім'я, Прізвище, Номер телефону та Електронну пошту.",
        },
        { status: 400 }
      )
    }

    const initialAddress =
      city && branch
        ? {
            carrier: (carrier || 'nova_poshta') as DeliveryCarrier,
            city: String(city),
            cityRef: cityRef ? String(cityRef) : undefined,
            branch: String(branch),
            branchRef: branchRef ? String(branchRef) : undefined,
          }
        : undefined

    const customer = await registerOrUpdateCustomer({
      firstName: String(firstName),
      lastName: String(lastName),
      phone: String(phone),
      email: String(email),
      googleAccount: googleAccount ? String(googleAccount) : undefined,
      googleId: googleId ? String(googleId) : undefined,
      password: password ? String(password) : undefined,
      initialAddress,
    })

    return NextResponse.json({ customer }, { status: 201 })
  } catch (err) {
    return NextResponse.json(
      { error: `Помилка реєстрації: ${(err as Error).message}` },
      { status: 500 }
    )
  }
}
