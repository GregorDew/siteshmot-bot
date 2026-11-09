export type DeliveryCarrier = 'nova_poshta' | 'ukrposhta'

export interface CustomerAddress {
  id: string
  customerId: string
  carrier: DeliveryCarrier
  city: string
  cityRef?: string
  branch: string
  branchRef?: string
  isDefault: boolean
  createdAt: string
}

export interface CustomerRecord {
  id: string
  firstName: string
  lastName: string
  phone: string
  email: string
  googleAccount?: string
  googleId?: string
  passwordHash?: string
  addresses: CustomerAddress[]
  createdAt: string
}

export interface OrderItemRecord {
  productId: number
  name: string
  categoryType: string
  gender: string
  material: string
  size: string
  price: number
  quantity: number
}

export interface OrderRecord {
  id: string
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
  totalPrice: number
  telegramSent: boolean
  createdAt: string
}

export interface BotAdminRecord {
  chatId: string
  username?: string
  firstName?: string
  registeredAt: string
}

interface CustomersDatabaseData {
  customers: CustomerRecord[]
  orders: OrderRecord[]
  botAdmins?: BotAdminRecord[]
}

const globalForCustomers = globalThis as unknown as {
  __CUSTOMERS_DB__?: CustomersDatabaseData
}

function getMemoryCustomersDb(): CustomersDatabaseData {
  if (!globalForCustomers.__CUSTOMERS_DB__) {
    globalForCustomers.__CUSTOMERS_DB__ = {
      customers: [],
      orders: [],
      botAdmins: [],
    }
  }
  if (!globalForCustomers.__CUSTOMERS_DB__.botAdmins) {
    globalForCustomers.__CUSTOMERS_DB__.botAdmins = []
  }
  return globalForCustomers.__CUSTOMERS_DB__
}

async function readCustomersDb(): Promise<CustomersDatabaseData> {
  try {
    const fs = await import('fs/promises')
    const path = await import('path')
    const dbPath = path.join(process.cwd(), 'db', 'customers_data.json')
    try {
      const raw = await fs.readFile(dbPath, 'utf-8')
      const parsed = JSON.parse(raw) as CustomersDatabaseData
      if (parsed && Array.isArray(parsed.customers)) {
        globalForCustomers.__CUSTOMERS_DB__ = parsed
        return parsed
      }
    } catch {
      const initial: CustomersDatabaseData = { customers: [], orders: [] }
      await fs.mkdir(path.dirname(dbPath), { recursive: true })
      await fs.writeFile(dbPath, JSON.stringify(initial, null, 2), 'utf-8')
      return initial
    }
  } catch {
    // Edge runtime fallback
  }
  return getMemoryCustomersDb()
}

async function writeCustomersDb(data: CustomersDatabaseData): Promise<void> {
  globalForCustomers.__CUSTOMERS_DB__ = data
  try {
    const fs = await import('fs/promises')
    const path = await import('path')
    const dbPath = path.join(process.cwd(), 'db', 'customers_data.json')
    await fs.mkdir(path.dirname(dbPath), { recursive: true })
    await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf-8')
  } catch {
    // Edge runtime fallback
  }
}

export async function getAllCustomers(): Promise<CustomerRecord[]> {
  const db = await readCustomersDb()
  return db.customers
}

export async function getCustomerById(id: string): Promise<CustomerRecord | null> {
  const db = await readCustomersDb()
  return db.customers.find((c) => c.id === id) ?? null
}

export async function getCustomerByEmailOrPhone(
  email: string,
  phone?: string
): Promise<CustomerRecord | null> {
  const db = await readCustomersDb()
  const normEmail = email.trim().toLowerCase()
  const normPhone = phone?.replace(/\s+/g, '')
  return (
    db.customers.find(
      (c) =>
        c.email.toLowerCase() === normEmail ||
        (normPhone && c.phone.replace(/\s+/g, '') === normPhone)
    ) ?? null
  )
}

export async function registerOrUpdateCustomer(input: {
  firstName: string
  lastName: string
  phone: string
  email: string
  googleAccount?: string
  googleId?: string
  password?: string
  initialAddress?: {
    carrier: DeliveryCarrier
    city: string
    cityRef?: string
    branch: string
    branchRef?: string
  }
}): Promise<CustomerRecord> {
  const db = await readCustomersDb()
  const normEmail = input.email.trim().toLowerCase()
  let existing = db.customers.find((c) => c.email.toLowerCase() === normEmail)

  const now = new Date().toISOString()

  if (existing) {
    existing.firstName = input.firstName.trim() || existing.firstName
    existing.lastName = input.lastName.trim() || existing.lastName
    existing.phone = input.phone.trim() || existing.phone
    if (input.googleAccount) existing.googleAccount = input.googleAccount
    if (input.googleId) existing.googleId = input.googleId

    if (
      input.initialAddress &&
      input.initialAddress.city &&
      input.initialAddress.branch
    ) {
      const duplicate = existing.addresses.find(
        (a) =>
          a.carrier === input.initialAddress!.carrier &&
          a.city === input.initialAddress!.city &&
          a.branch === input.initialAddress!.branch
      )
      if (!duplicate) {
        existing.addresses.forEach((a) => (a.isDefault = false))
        existing.addresses.push({
          id: `addr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          customerId: existing.id,
          carrier: input.initialAddress.carrier,
          city: input.initialAddress.city,
          cityRef: input.initialAddress.cityRef,
          branch: input.initialAddress.branch,
          branchRef: input.initialAddress.branchRef,
          isDefault: true,
          createdAt: now,
        })
      }
    }

    await writeCustomersDb(db)
    return existing
  }

  const customerId = `cust_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
  const addresses: CustomerAddress[] = []

  if (
    input.initialAddress &&
    input.initialAddress.city &&
    input.initialAddress.branch
  ) {
    addresses.push({
      id: `addr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      customerId,
      carrier: input.initialAddress.carrier,
      city: input.initialAddress.city,
      cityRef: input.initialAddress.cityRef,
      branch: input.initialAddress.branch,
      branchRef: input.initialAddress.branchRef,
      isDefault: true,
      createdAt: now,
    })
  }

  const newCustomer: CustomerRecord = {
    id: customerId,
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    phone: input.phone.trim(),
    email: normEmail,
    googleAccount: input.googleAccount?.trim() || undefined,
    googleId: input.googleId,
    passwordHash: input.password ? `hashed_${input.password}` : undefined,
    addresses,
    createdAt: now,
  }

  db.customers.unshift(newCustomer)
  await writeCustomersDb(db)
  return newCustomer
}

export async function addAddressToCustomer(
  customerId: string,
  addressInput: {
    carrier: DeliveryCarrier
    city: string
    cityRef?: string
    branch: string
    branchRef?: string
  }
): Promise<CustomerRecord | null> {
  const db = await readCustomersDb()
  const customer = db.customers.find((c) => c.id === customerId)
  if (!customer) return null

  customer.addresses.forEach((a) => (a.isDefault = false))

  const newAddr: CustomerAddress = {
    id: `addr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    customerId: customer.id,
    carrier: addressInput.carrier,
    city: addressInput.city.trim(),
    cityRef: addressInput.cityRef,
    branch: addressInput.branch.trim(),
    branchRef: addressInput.branchRef,
    isDefault: true,
    createdAt: new Date().toISOString(),
  }

  customer.addresses.push(newAddr)
  await writeCustomersDb(db)
  return customer
}

export async function saveOrderToDb(order: OrderRecord): Promise<OrderRecord> {
  const db = await readCustomersDb()
  db.orders.unshift(order)
  await writeCustomersDb(db)
  return order
}

export async function getAllOrders(): Promise<OrderRecord[]> {
  const db = await readCustomersDb()
  return db.orders
}

export async function getBotAdmins(): Promise<BotAdminRecord[]> {
  const db = await readCustomersDb()
  return db.botAdmins ?? []
}

export async function saveBotAdmin(admin: {
  chatId: string
  username?: string
  firstName?: string
}): Promise<BotAdminRecord[]> {
  const db = await readCustomersDb()
  if (!db.botAdmins) db.botAdmins = []

  const existing = db.botAdmins.find((a) => a.chatId === String(admin.chatId))
  if (existing) {
    if (admin.username) existing.username = admin.username
    if (admin.firstName) existing.firstName = admin.firstName
  } else {
    db.botAdmins.push({
      chatId: String(admin.chatId),
      username: admin.username,
      firstName: admin.firstName,
      registeredAt: new Date().toISOString(),
    })
  }

  await writeCustomersDb(db)
  return db.botAdmins
}

