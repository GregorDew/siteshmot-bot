'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Database,
  LogOut,
  MapPin,
  Minus,
  Plus,
  Search,
  Send,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trash2,
  Truck,
  UserRound,
  X,
} from 'lucide-react'
import {
  CATEGORY_LABELS,
  GENDER_LABELS,
  INITIAL_PRODUCTS,
  type ProductCategoryType,
  type ProductGender,
  type ProductRecord,
} from '@/lib/db-products'
import type { CustomerRecord, OrderRecord } from '@/lib/db-customers'
import {
  DeliveryAddressPicker,
  type SelectedAddressValue,
} from '@/components/delivery-address-picker'

export { INITIAL_PRODUCTS as products }

interface CartEntry {
  key: string
  productId: number
  size: string
  quantity: number
}

const CATEGORY_FILTERS: Array<{ id: 'all' | ProductCategoryType; label: string }> = [
  { id: 'all', label: 'Усі товари' },
  { id: 'footwear', label: 'Взуття' },
  { id: 'upper_clothing', label: 'Верхній одяг' },
  { id: 'lower_clothing', label: 'Нижній одяг' },
  { id: 'accessory', label: 'Аксесуари' },
]

const GENDER_FILTERS: Array<{ id: 'all' | ProductGender; label: string }> = [
  { id: 'all', label: 'Усі' },
  { id: 'female', label: 'Жіночий' },
  { id: 'male', label: 'Чоловічий' },
  { id: 'unisex', label: 'Унісекс' },
]

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid size-8 place-items-center rounded-full bg-[#bde5f0] text-sm font-semibold text-[#183b46]">
        m
      </span>
      <span className="text-lg font-semibold tracking-[-0.04em]">mellow</span>
    </div>
  )
}

function Header({
  cartCount,
  customer,
  onCart,
  onHome,
  onSearch,
  onAccount,
  onDatabases,
}: {
  cartCount: number
  customer: CustomerRecord | null
  onCart: () => void
  onHome: () => void
  onSearch: () => void
  onAccount: () => void
  onDatabases: () => void
}) {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
      <button
        onClick={onHome}
        aria-label="На головну"
        className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#77c9dc]"
      >
        <Logo />
      </button>

      <nav
        aria-label="Навігація"
        className="hidden items-center gap-6 text-xs font-medium text-[#536268] md:flex"
      >
        <button onClick={onHome} className="transition hover:text-[#183b46]">
          Каталог одягу
        </button>
        <button onClick={onAccount} className="transition hover:text-[#183b46]">
          {customer ? `Кабінет (${customer.firstName})` : 'Реєстрація / Вхід'}
        </button>
        <button
          onClick={onDatabases}
          className="flex items-center gap-1.5 rounded-full border border-[#d7e8eb] bg-[#eff8fa] px-3 py-1.5 text-[#183b46] transition hover:bg-[#dff1f5]"
        >
          <Database className="size-3.5" /> Бази даних (Покупці + Товари)
        </button>
      </nav>

      <div className="flex items-center gap-2">
        <button
          onClick={onDatabases}
          aria-label="Бази даних"
          title="Керування БД Покупців та БД Товарів"
          className="grid size-10 place-items-center rounded-full border border-[#dce2e2] text-[#214751] transition hover:bg-[#eff9fb] md:hidden"
        >
          <Database />
        </button>

        <button
          onClick={onSearch}
          aria-label="Пошук"
          className="grid size-10 place-items-center rounded-full border border-[#dce2e2] transition hover:bg-[#eff9fb]"
        >
          <Search />
        </button>

        <button
          onClick={onAccount}
          aria-label="Акаунт покупця"
          className="relative flex h-10 items-center gap-2 rounded-full bg-[#eff8fa] px-3.5 text-xs font-medium text-[#214751] transition hover:bg-[#e1f2f6]"
        >
          <UserRound className="size-4" />
          <span className="hidden sm:inline">
            {customer ? customer.firstName : 'Реєстрація'}
          </span>
          {customer && (
            <span
              title="Авторизовано"
              className="size-2 rounded-full bg-emerald-500"
            />
          )}
        </button>

        <button
          onClick={onCart}
          aria-label={`Кошик (${cartCount})`}
          className="relative grid size-10 place-items-center rounded-full bg-[#bde5f0] text-[#183b46] transition hover:bg-[#a9dce9]"
        >
          <ShoppingBag />
          <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-[#183b46] text-[10px] font-semibold text-white">
            {cartCount}
          </span>
        </button>
      </div>
    </header>
  )
}

function ProductCard({
  product,
  onSelect,
  onQuickAdd,
}: {
  product: ProductRecord
  onSelect: () => void
  onQuickAdd: (size: string) => void
}) {
  const [chosenSize, setChosenSize] = useState<string>(product.sizes[0] || 'One Size')

  useEffect(() => {
    setChosenSize(product.sizes[0] || 'One Size')
  }, [product.sizes])

  return (
    <article className="group flex flex-col">
      <button
        onClick={onSelect}
        className={`relative block aspect-[0.86] w-full overflow-hidden rounded-[24px] ${product.color} text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#77c9dc]`}
      >
        <img
          src={product.image}
          alt={product.name}
          className="size-full object-cover mix-blend-multiply transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.1em] text-[#1f3034]">
            {CATEGORY_LABELS[product.categoryType]}
          </span>
          <span className="rounded-full bg-[#183b46]/85 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.1em] text-white">
            {GENDER_LABELS[product.gender]}
          </span>
        </div>
        <span className="absolute bottom-3 right-3 grid size-9 place-items-center rounded-full bg-white text-[#183b46] opacity-0 shadow-sm transition group-hover:opacity-100">
          <Plus />
        </span>
      </button>

      <div className="flex items-start justify-between gap-3 px-1 pt-3">
        <button onClick={onSelect} className="text-left">
          <h3 className="text-sm font-medium text-[#1f3034]">{product.name}</h3>
          <p className="pt-1 text-xs text-[#829096]">{product.material}</p>
        </button>
        <button
          onClick={() => onQuickAdd(chosenSize)}
          aria-label={`Додати ${product.name} у кошик`}
          title="Додати у кошик"
          className="mt-0.5 flex shrink-0 items-center gap-1 rounded-full bg-[#eff8fa] px-2.5 py-1 text-xs font-medium text-[#183b46] transition hover:bg-[#bde5f0]"
        >
          <Plus className="size-3.5" /> В кошик
        </button>
      </div>

      {/* Вибір розміру прямо на картці (для взуття та одягу) */}
      <div className="mt-2.5 flex flex-wrap items-center gap-1 px-1">
        <span className="mr-1 text-[11px] text-[#829096]">Розмір:</span>
        {product.sizes.map((sz) => (
          <button
            key={sz}
            type="button"
            onClick={() => setChosenSize(sz)}
            className={`rounded-md px-1.5 py-0.5 text-[11px] font-medium transition ${
              chosenSize === sz
                ? 'bg-[#183b46] text-white'
                : 'bg-[#eff4f5] text-[#536268] hover:bg-[#dce9ec]'
            }`}
          >
            {sz}
          </button>
        ))}
      </div>

      <p className="mt-auto px-1 pt-2.5 text-sm font-semibold text-[#1f3034]">
        {product.price} грн
      </p>
    </article>
  )
}

export default function Storefront() {
  const [view, setView] = useState<
    'shop' | 'cart' | 'detail' | 'account' | 'databases'
  >('shop')

  // БД №2: Товари
  const [productsList, setProductsList] = useState<ProductRecord[]>(INITIAL_PRODUCTS)
  const [selected, setSelected] = useState<ProductRecord>(INITIAL_PRODUCTS[0])
  const [selectedDetailSize, setSelectedDetailSize] = useState<string>(
    INITIAL_PRODUCTS[0].sizes[0] || 'One Size'
  )

  // Фільтри каталогу
  const [categoryFilter, setCategoryFilter] = useState<'all' | ProductCategoryType>('all')
  const [genderFilter, setGenderFilter] = useState<'all' | ProductGender>('all')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('Latest')

  // Кошик
  const [cart, setCart] = useState<CartEntry[]>([])

  // БД №1: Поточний зареєстрований покупець
  const [customer, setCustomer] = useState<CustomerRecord | null>(null)
  const [authNotice, setAuthNotice] = useState<string | null>(null)
  const [pendingCartAdd, setPendingCartAdd] = useState<{
    productId: number
    size: string
  } | null>(null)

  // Форма реєстрації покупця
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('+380')
  const [email, setEmail] = useState('')
  const [googleAccount, setGoogleAccount] = useState('')
  const [regAddress, setRegAddress] = useState<SelectedAddressValue>({
    carrier: 'nova_poshta',
    city: 'м. Київ',
    branch: 'Відділення №1: вул. Хрещатик, 8 (Вантажне)',
  })
  const [authError, setAuthError] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(false)

  // Google швидкий вибір профілю (або введення Google акаунта)
  const [showGoogleModal, setShowGoogleModal] = useState(false)
  const [googleInputEmail, setGoogleInputEmail] = useState('')
  const [googleInputFirst, setGoogleInputFirst] = useState('')
  const [googleInputLast, setGoogleInputLast] = useState('')

  // Вибір адреси у кошику та додавання іншої адреси
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  const [showAddAnotherAddress, setShowAddAnotherAddress] = useState(false)
  const [newCartAddress, setNewCartAddress] = useState<SelectedAddressValue>({
    carrier: 'nova_poshta',
    city: 'м. Львів',
    branch: '',
  })
  const [savingAddress, setSavingAddress] = useState(false)

  // Статус оформлення замовлення та відправки в Telegram
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [completedOrder, setCompletedOrder] = useState<{
    order: OrderRecord
    telegramMessage: string
    telegramSent: boolean
  } | null>(null)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  // Дані для перегляду та керування двома БД (Адмін-панель БД №1 та БД №2)
  const [allCustomersDb, setAllCustomersDb] = useState<CustomerRecord[]>([])
  const [allOrdersDb, setAllOrdersDb] = useState<OrderRecord[]>([])
  const [newProdName, setNewProdName] = useState('')
  const [newProdPrice, setNewProdPrice] = useState('1950')
  const [newProdDesc, setNewProdDesc] = useState('')
  const [newProdMaterial, setNewProdMaterial] = useState('100% Бавовна')
  const [newProdCategory, setNewProdCategory] =
    useState<ProductCategoryType>('upper_clothing')
  const [newProdGender, setNewProdGender] = useState<ProductGender>('unisex')
  const [newProdSizes, setNewProdSizes] = useState('XS, S, M, L, XL')
  const [newProdImage, setNewProdImage] = useState('')
  const [prodCreateNotice, setProdCreateNotice] = useState<string | null>(null)

  // Завантаження товарів з БД №2 та відновлення сесії покупця
  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.products) && data.products.length > 0) {
          setProductsList(data.products)
          setSelected(data.products[0])
          setSelectedDetailSize(data.products[0].sizes[0] || 'One Size')
        }
      })
      .catch(() => {})

    try {
      const savedCustomer = localStorage.getItem('mellow_customer')
      if (savedCustomer) {
        const parsed = JSON.parse(savedCustomer) as CustomerRecord
        setCustomer(parsed)
        const defAddr =
          parsed.addresses?.find((a) => a.isDefault) || parsed.addresses?.[0]
        if (defAddr) setSelectedAddressId(defAddr.id)
      }
      const savedCart = localStorage.getItem('mellow_cart')
      if (savedCart) {
        setCart(JSON.parse(savedCart))
      }
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('mellow_cart', JSON.stringify(cart))
    } catch {}
  }, [cart])

  const refreshAdminDatabases = () => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.products)) setProductsList(d.products)
      })
      .catch(() => {})

    fetch('/api/auth?mode=admin')
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.customers)) setAllCustomersDb(d.customers)
        if (Array.isArray(d.orders)) setAllOrdersDb(d.orders)
      })
      .catch(() => {})
  }

  useEffect(() => {
    if (view === 'databases') {
      refreshAdminDatabases()
    }
  }, [view])

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  )

  const detailedCartItems = useMemo(() => {
    return cart
      .map((entry) => {
        const product = productsList.find((p) => p.id === entry.productId)
        if (!product) return null
        return {
          ...entry,
          product,
        }
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
  }, [cart, productsList])

  const total = useMemo(
    () =>
      detailedCartItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      ),
    [detailedCartItems]
  )

  const visibleProducts = useMemo(() => {
    return productsList
      .filter((p) => {
        const matchCat =
          categoryFilter === 'all' || p.categoryType === categoryFilter
        const matchGender = genderFilter === 'all' || p.gender === genderFilter
        const q = query.trim().toLowerCase()
        const matchQuery =
          !q ||
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.material.toLowerCase().includes(q)
        return matchCat && matchGender && matchQuery
      })
      .sort((a, b) =>
        sort === 'Price: low to high'
          ? a.price - b.price
          : sort === 'Price: high to low'
            ? b.price - a.price
            : b.id - a.id
      )
  }, [productsList, categoryFilter, genderFilter, query, sort])

  // Головна логіка: коли людина додає товар у кошик -> якщо не зареєстрована, ведемо на реєстрацію!
  const addItemToCartDirect = (productId: number, size: string) => {
    const key = `${productId}__${size}`
    setCart((prev) => {
      const existingIndex = prev.findIndex((i) => i.key === key)
      if (existingIndex > -1) {
        const copy = [...prev]
        copy[existingIndex] = {
          ...copy[existingIndex],
          quantity: copy[existingIndex].quantity + 1,
        }
        return copy
      }
      return [...prev, { key, productId, size, quantity: 1 }]
    })
  }

  const handleAddToCart = (productId: number, size: string) => {
    const prod = productsList.find((p) => p.id === productId)
    const finalSize = size || prod?.sizes[0] || 'One Size'

    if (!customer) {
      setPendingCartAdd({ productId, size: finalSize })
      setAuthNotice(
        `Щоб додати «${prod?.name || 'товар'}» (розмір ${finalSize}) у кошик та вибрати адресу доставки, будь ласка, зареєструйтеся або увійдіть.`
      )
      setView('account')
      return
    }

    addItemToCartDirect(productId, finalSize)
    setCompletedOrder(null)
    setView('cart')
  }

  const updateCartQuantity = (key: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) =>
          item.key === key ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    })
  }

  const openProductDetail = (product: ProductRecord) => {
    setSelected(product)
    setSelectedDetailSize(product.sizes[0] || 'One Size')
    setView('detail')
  }

  // Обробка реєстрації або входу покупця
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)
    setAuthLoading(true)

    try {
      const payload =
        authMode === 'login'
          ? { action: 'login', email, phone }
          : {
              action: 'register',
              firstName,
              lastName,
              phone,
              email,
              googleAccount: googleAccount || undefined,
              carrier: regAddress.carrier,
              city: regAddress.city,
              cityRef: regAddress.cityRef,
              branch: regAddress.branch,
            }

      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (!res.ok || !data.customer) {
        setAuthError(data.error || 'Помилка авторизації.')
        setAuthLoading(false)
        return
      }

      const savedCustomer: CustomerRecord = data.customer
      setCustomer(savedCustomer)
      localStorage.setItem('mellow_customer', JSON.stringify(savedCustomer))

      const defaultAddr =
        savedCustomer.addresses.find((a) => a.isDefault) ||
        savedCustomer.addresses[0]
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id)
      }

      setAuthNotice(null)

      // Якщо користувач намагався додати товар у кошик перед реєстрацією — додаємо його і переводимо в кошик на вибір адреси!
      if (pendingCartAdd) {
        addItemToCartDirect(pendingCartAdd.productId, pendingCartAdd.size)
        setPendingCartAdd(null)
        setView('cart')
      } else if (cart.length > 0) {
        setView('cart')
      }
    } catch (err) {
      setAuthError((err as Error).message)
    } finally {
      setAuthLoading(false)
    }
  }

  const handleGoogleQuickApply = (e: React.FormEvent) => {
    e.preventDefault()
    if (!googleInputEmail) return
    setEmail(googleInputEmail)
    setGoogleAccount(googleInputEmail)
    if (googleInputFirst) setFirstName(googleInputFirst)
    if (googleInputLast) setLastName(googleInputLast)
    setShowGoogleModal(false)
  }

  // Додавання іншої адреси Нової Пошти / Укрпошти в кошику
  const handleSaveAnotherAddress = async () => {
    if (!customer) return
    if (!newCartAddress.city || !newCartAddress.branch) {
      setCheckoutError('Оберіть місто та відділення Нової Пошти або Укрпошти.')
      return
    }
    setSavingAddress(true)
    setCheckoutError(null)
    try {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customer.id,
          carrier: newCartAddress.carrier,
          city: newCartAddress.city,
          cityRef: newCartAddress.cityRef,
          branch: newCartAddress.branch,
        }),
      })
      const data = await res.json()
      if (res.ok && data.customer) {
        const updated: CustomerRecord = data.customer
        setCustomer(updated)
        localStorage.setItem('mellow_customer', JSON.stringify(updated))
        const newest = updated.addresses[updated.addresses.length - 1]
        if (newest) setSelectedAddressId(newest.id)
        setShowAddAnotherAddress(false)
      } else {
        setCheckoutError(data.error || 'Не вдалося додати адресу')
      }
    } catch (err) {
      setCheckoutError((err as Error).message)
    } finally {
      setSavingAddress(false)
    }
  }

  // Оформлення замовлення (Кнопка «Купити») -> Відправка в Telegram-бот
  const handleBuyOrder = async () => {
    setCheckoutError(null)

    if (!customer) {
      setAuthNotice('Будь ласка, зареєструйтеся перед оформленням замовлення.')
      setView('account')
      return
    }

    const chosenAddress =
      customer.addresses.find((a) => a.id === selectedAddressId) ||
      customer.addresses[0]

    if (!chosenAddress) {
      setCheckoutError(
        'Будь ласка, оберіть адресу доставки або натисніть «Додати іншу адресу».'
      )
      setShowAddAnotherAddress(true)
      return
    }

    if (detailedCartItems.length === 0) {
      setCheckoutError('Ваш кошик порожній.')
      return
    }

    setCheckoutLoading(true)
    try {
      const orderItems = detailedCartItems.map((entry) => ({
        productId: entry.product.id,
        name: entry.product.name,
        categoryType: CATEGORY_LABELS[entry.product.categoryType],
        gender: GENDER_LABELS[entry.product.gender],
        material: entry.product.material,
        size: entry.size,
        price: entry.product.price,
        quantity: entry.quantity,
      }))

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customer.id,
          customerSnapshot: {
            firstName: customer.firstName,
            lastName: customer.lastName,
            phone: customer.phone,
            email: customer.email,
            googleAccount: customer.googleAccount,
          },
          address: chosenAddress,
          items: orderItems,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.order) {
        setCheckoutError(data.error || 'Помилка при оформленні замовлення.')
        return
      }

      setCompletedOrder({
        order: data.order,
        telegramMessage: data.telegramStatus?.details || 'Замовлення збережено!',
        telegramSent: Boolean(data.telegramStatus?.sent),
      })
      setCart([])
      localStorage.removeItem('mellow_cart')
    } catch (err) {
      setCheckoutError((err as Error).message)
    } finally {
      setCheckoutLoading(false)
    }
  }

  // Створення нового товару у БД №2
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setProdCreateNotice(null)
    const sizesArray = newProdSizes
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newProdName,
        price: Number(newProdPrice),
        description: newProdDesc,
        material: newProdMaterial,
        categoryType: newProdCategory,
        gender: newProdGender,
        sizes: sizesArray.length > 0 ? sizesArray : ['One Size'],
        image: newProdImage || undefined,
      }),
    })
    const data = await res.json()
    if (res.ok && data.product) {
      setProdCreateNotice(`Товар «${data.product.name}» успішно додано в БД №2!`)
      setNewProdName('')
      setNewProdDesc('')
      refreshAdminDatabases()
    }
  }

  const handleDeleteProduct = async (id: number) => {
    await fetch(`/api/products?id=${id}`, { method: 'DELETE' })
    refreshAdminDatabases()
  }

  const handleLogout = () => {
    setCustomer(null)
    localStorage.removeItem('mellow_customer')
  }

  return (
    <main className="min-h-screen bg-[#fbfcfb] text-[#1f3034]">
      <Header
        cartCount={cartCount}
        customer={customer}
        onCart={() => {
          setCompletedOrder(null)
          setView('cart')
        }}
        onHome={() => setView('shop')}
        onSearch={() => {
          setView('shop')
          setTimeout(() => document.getElementById('store-search')?.focus(), 0)
        }}
        onAccount={() => setView('account')}
        onDatabases={() => setView('databases')}
      />

      {/* ==================== ЕКРАН 1: ВІТРИНА ТОВАРІВ (SHOP) ==================== */}
      {view === 'shop' && (
        <section className="mx-auto max-w-6xl px-5 pb-16 pt-10 sm:px-8 lg:px-10">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-[#78aeba]">
                Продуманий одяг, взуття та аксесуари
              </p>
              <h1 className="max-w-xl text-4xl font-medium leading-[1.04] tracking-[-0.06em] sm:text-6xl">
                Якісні речі для
                <br />
                <em className="font-serif font-normal text-[#77b8c7]">
                  щоденного образу.
                </em>
              </h1>
            </div>

            <label className="flex items-center gap-2 rounded-full border border-[#dce2e2] px-3 py-2.5 text-xs text-[#536268] sm:px-4">
              Сортувати:
              <select
                aria-label="Сортування товарів"
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="bg-transparent font-medium text-[#1f3034] outline-none"
              >
                <option value="Latest">Новинки</option>
                <option value="Price: low to high">Ціна: від дешевших</option>
                <option value="Price: high to low">Ціна: від дорожчих</option>
              </select>
              <ChevronDown />
            </label>
          </div>

          {/* Пошук та фільтр за статтю */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex w-full items-center gap-3 rounded-full border border-[#e5e9e8] bg-white px-4 py-2.5 md:max-w-sm">
              <Search className="text-[#98a3a6]" />
              <input
                id="store-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Пошук за назвою, описом або матеріалом..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-[#98a3a6]"
              />
            </div>

            <div className="flex items-center gap-1.5 rounded-full border border-[#e5e9e8] bg-white p-1">
              {GENDER_FILTERS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGenderFilter(g.id)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                    genderFilter === g.id
                      ? 'bg-[#183b46] text-white'
                      : 'text-[#536268] hover:bg-[#eff8fa]'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Фільтри за видом: Взуття, Верхній одяг, Нижній одяг, Аксесуари */}
          <div className="mb-8 flex items-center justify-between gap-4 border-b border-[#e5e9e8] pb-4">
            <div className="flex flex-wrap gap-x-5 gap-y-3 text-sm">
              {CATEGORY_FILTERS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCategoryFilter(item.id)}
                  className={
                    categoryFilter === item.id
                      ? 'font-semibold text-[#1f3034] underline decoration-[#77b8c7] decoration-2 underline-offset-8'
                      : 'text-[#98a3a6] hover:text-[#536268]'
                  }
                >
                  {item.label}
                </button>
              ))}
            </div>
            <span className="shrink-0 text-xs text-[#98a3a6]">
              {visibleProducts.length} позицій
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-x-5 lg:grid-cols-3 lg:gap-y-12">
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickAdd={(size) => handleAddToCart(product.id, size)}
                onSelect={() => openProductDetail(product)}
              />
            ))}
          </div>
        </section>
      )}

      {/* ==================== ЕКРАН 2: СТОРІНКА ТОВАРУ (DETAIL) ==================== */}
      {view === 'detail' && (
        <section className="mx-auto max-w-6xl px-5 pb-16 pt-8 sm:px-8 lg:px-10">
          <button
            onClick={() => setView('shop')}
            className="mb-8 flex items-center gap-2 text-sm text-[#718084] hover:text-[#183b46]"
          >
            <ArrowLeft /> Повернутися до каталогу
          </button>

          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
            <div
              className={`aspect-square overflow-hidden rounded-[32px] ${selected.color}`}
            >
              <img
                src={selected.image}
                alt={selected.name}
                className="size-full object-cover mix-blend-multiply"
              />
            </div>

            <div className="flex flex-col justify-center">
              <div className="mb-3 flex items-center gap-2">
                <span className="rounded-full bg-[#eff8fa] px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-[#183b46]">
                  {CATEGORY_LABELS[selected.categoryType]}
                </span>
                <span className="rounded-full border border-[#dce2e2] px-3 py-1 text-xs font-medium text-[#536268]">
                  {GENDER_LABELS[selected.gender]}
                </span>
              </div>

              <h1 className="text-3xl font-medium tracking-[-0.04em] sm:text-5xl">
                {selected.name}
              </h1>
              <p className="mt-4 text-2xl font-semibold text-[#183b46]">
                {selected.price} грн
              </p>

              <p className="mt-6 max-w-md text-base leading-7 text-[#536268]">
                {selected.description}
              </p>

              {/* Вибір розміру для взуття або одягу */}
              <div className="mt-7">
                <div className="mb-2.5 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#536268]">
                    Оберіть розмір (
                    {selected.categoryType === 'footwear'
                      ? 'Розмірна сітка взуття EU'
                      : selected.categoryType === 'accessory'
                        ? 'Універсальний'
                        : 'Розмір одягу'}
                    ):
                  </span>
                  <span className="text-xs font-semibold text-[#183b46]">
                    Обрано: {selectedDetailSize}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selected.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedDetailSize(size)}
                      className={`min-w-12 rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition ${
                        selectedDetailSize === size
                          ? 'border-[#183b46] bg-[#183b46] text-white shadow-xs'
                          : 'border-[#dce2e2] bg-white text-[#1f3034] hover:border-[#78aeba]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="my-7 border-y border-[#e5e9e8] py-4 text-sm text-[#536268]">
                <div className="flex justify-between py-1.5">
                  <span>Матеріал</span>
                  <span className="font-medium text-[#1f3034]">
                    {selected.material}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span>Вид / Стать</span>
                  <span className="font-medium text-[#1f3034]">
                    {CATEGORY_LABELS[selected.categoryType]} •{' '}
                    {GENDER_LABELS[selected.gender]}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span>Доставка по Україні</span>
                  <span className="font-medium text-[#1f3034]">
                    Нова Пошта та Укрпошта (1–3 дні)
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleAddToCart(selected.id, selectedDetailSize)}
                className="flex items-center justify-center gap-3 rounded-full bg-[#183b46] px-6 py-4 text-sm font-medium text-white transition hover:bg-[#285865]"
              >
                Додати в кошик (Розмір {selectedDetailSize}) <ArrowRight />
              </button>

              {!customer && (
                <p className="mt-3 text-center text-xs text-[#718084]">
                  * При додаванні в кошик система запропонує швидку реєстрацію та вибір відділення доставки.
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ==================== ЕКРАН 3: СТОРІНКА РЕЄСТРАЦІЇ ТА КАБІНЕТУ (ACCOUNT) ==================== */}
      {view === 'account' && (
        <section className="mx-auto max-w-3xl px-5 pb-16 pt-8 sm:px-8 lg:px-10">
          <button
            onClick={() => setView('shop')}
            className="mb-6 flex items-center gap-2 text-sm text-[#718084] hover:text-[#183b46]"
          >
            <ArrowLeft /> Повернутися до магазину
          </button>

          {authNotice && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-[#78aeba] bg-[#eff8fa] p-4 text-sm text-[#183b46]">
              <Sparkles className="mt-0.5 shrink-0 text-[#183b46]" />
              <div>
                <p className="font-medium">{authNotice}</p>
              </div>
            </div>
          )}

          {customer ? (
            /* Якщо покупець вже зареєстрований */
            <div className="rounded-[28px] bg-[#eff8fa] p-6 sm:p-10">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
                    <ShieldCheck className="size-3.5" /> Зареєстрований покупець (БД №1)
                  </span>
                  <h1 className="mt-3 text-3xl font-medium tracking-[-0.04em] sm:text-4xl">
                    {customer.firstName} {customer.lastName}
                  </h1>
                  <p className="mt-1 text-sm text-[#536268]">
                    Телефон: <b>{customer.phone}</b> • Email: <b>{customer.email}</b>
                  </p>
                  {customer.googleAccount && (
                    <p className="mt-1 text-xs text-[#183b46]">
                      Google-акаунт підключено: <b>{customer.googleAccount}</b>
                    </p>
                  )}
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-full border border-[#cbd8da] bg-white px-4 py-2 text-xs font-medium text-[#536268] transition hover:bg-red-50 hover:text-red-700"
                >
                  <LogOut className="size-3.5" /> Вийти з профілю
                </button>
              </div>

              <div className="mt-8 border-t border-[#d7e9ec] pt-6">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-[#183b46]">
                  Збережені адреси доставки ({customer.addresses.length})
                </h2>

                <div className="space-y-2.5">
                  {customer.addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="flex items-center justify-between rounded-2xl border border-[#d7e8eb] bg-white p-4 text-sm"
                    >
                      <div className="flex items-start gap-3">
                        <MapPin className="mt-0.5 shrink-0 text-[#183b46]" />
                        <div>
                          <span className="inline-block rounded-md bg-[#eff8fa] px-2 py-0.5 text-[11px] font-semibold text-[#183b46]">
                            {addr.carrier === 'nova_poshta'
                              ? 'Нова Пошта'
                              : 'Укрпошта'}
                          </span>
                          <p className="mt-1 font-medium text-[#1f3034]">
                            {addr.city} — {addr.branch}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={() => setView('cart')}
                    className="flex items-center gap-2 rounded-full bg-[#183b46] px-6 py-3 text-xs font-medium text-white transition hover:bg-[#285865]"
                  >
                    Перейти до кошика ({cartCount}) <ArrowRight />
                  </button>
                  <button
                    onClick={() => setView('shop')}
                    className="rounded-full border border-[#183b46] px-6 py-3 text-xs font-medium text-[#183b46]"
                  >
                    Продовжити покупки
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Форма реєстрації / входу покупця */
            <div className="rounded-[28px] bg-[#eff8fa] p-6 sm:p-10">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#78aeba]">
                    Обліковий запис покупця
                  </p>
                  <h1 className="mt-1 text-3xl font-medium tracking-[-0.05em] sm:text-4xl">
                    {authMode === 'register'
                      ? 'Реєстрація покупця'
                      : 'Вхід для постійних клієнтів'}
                  </h1>
                </div>

                <div className="flex rounded-full border border-[#cbe0e5] bg-white p-1 text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setAuthMode('register')}
                    className={`rounded-full px-4 py-1.5 transition ${
                      authMode === 'register'
                        ? 'bg-[#183b46] text-white'
                        : 'text-[#536268]'
                    }`}
                  >
                    Реєстрація
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className={`rounded-full px-4 py-1.5 transition ${
                      authMode === 'login'
                        ? 'bg-[#183b46] text-white'
                        : 'text-[#536268]'
                    }`}
                  >
                    Вже є акаунт
                  </button>
                </div>
              </div>

              {/* Кнопка прив'язки Google-акаунта */}
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(!showGoogleModal)}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl border border-[#cbd8da] bg-white px-4 py-3 text-xs font-semibold text-[#1f3034] shadow-2xs transition hover:bg-[#f8fcfd]"
                >
                  <svg className="size-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z"
                    />
                  </svg>
                  {googleAccount
                    ? `Підключено Google: ${googleAccount}`
                    : 'Швидке заповнення через Google-акаунт'}
                </button>

                {showGoogleModal && (
                  <form
                    onSubmit={handleGoogleQuickApply}
                    className="mt-3 rounded-2xl border border-[#78aeba] bg-white p-4 space-y-3"
                  >
                    <p className="text-xs font-semibold text-[#183b46]">
                      Вкажіть ваш Google-акаунт (Gmail) для швидкої авторизації:
                    </p>
                    <div className="grid gap-2 sm:grid-cols-3">
                      <input
                        type="email"
                        required
                        value={googleInputEmail}
                        onChange={(e) => setGoogleInputEmail(e.target.value)}
                        placeholder="your.name@gmail.com"
                        className="rounded-xl border border-[#dce2e2] px-3 py-2 text-xs outline-none focus:border-[#183b46]"
                      />
                      <input
                        type="text"
                        value={googleInputFirst}
                        onChange={(e) => setGoogleInputFirst(e.target.value)}
                        placeholder="Ім'я з Google"
                        className="rounded-xl border border-[#dce2e2] px-3 py-2 text-xs outline-none focus:border-[#183b46]"
                      />
                      <input
                        type="text"
                        value={googleInputLast}
                        onChange={(e) => setGoogleInputLast(e.target.value)}
                        placeholder="Прізвище з Google"
                        className="rounded-xl border border-[#dce2e2] px-3 py-2 text-xs outline-none focus:border-[#183b46]"
                      />
                    </div>
                    <button
                      type="submit"
                      className="rounded-xl bg-[#183b46] px-4 py-2 text-xs font-medium text-white"
                    >
                      Підставити дані Google
                    </button>
                  </form>
                )}
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {authMode === 'register' && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-[#536268]">
                        Ім’я *
                      </label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Напр. Олександр"
                        className="w-full rounded-xl border border-[#dce2e2] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#183b46]"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-[#536268]">
                        Прізвище *
                      </label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Напр. Коваленко"
                        className="w-full rounded-xl border border-[#dce2e2] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#183b46]"
                      />
                    </div>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[#536268]">
                      Номер телефону *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+380 (XX) XXX-XX-XX"
                      className="w-full rounded-xl border border-[#dce2e2] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#183b46]"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[#536268]">
                      Електронна пошта (Email / Google) *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@gmail.com"
                      className="w-full rounded-xl border border-[#dce2e2] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#183b46]"
                    />
                  </div>
                </div>

                {authMode === 'register' && (
                  <>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-[#536268]">
                        Google-профіль (необов’язково, якщо вказали вище)
                      </label>
                      <input
                        type="text"
                        value={googleAccount}
                        onChange={(e) => setGoogleAccount(e.target.value)}
                        placeholder="Ваш Google email або залиште порожнім"
                        className="w-full rounded-xl border border-[#dce2e2] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#183b46]"
                      />
                    </div>

                    {/* Вибір адреси Нової Пошти та Укрпошти прямо при реєстрації */}
                    <DeliveryAddressPicker
                      value={regAddress}
                      onChange={setRegAddress}
                    />
                  </>
                )}

                {authError && (
                  <div className="rounded-xl bg-red-50 p-3 text-xs font-medium text-red-700">
                    {authError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#183b46] py-3.5 text-sm font-medium text-white transition hover:bg-[#255563] disabled:opacity-50"
                >
                  {authLoading
                    ? 'Збереження у БД покуців...'
                    : authMode === 'register'
                      ? 'Зареєструватися та зберегти адресу'
                      : 'Увійти в кабінет'}
                  <ArrowRight />
                </button>
              </form>
            </div>
          )}
        </section>
      )}

      {/* ==================== ЕКРАН 4: КОШИК, ВИБІР АДРЕСИ ТА КНОПКА «КУПИТИ» (CART) ==================== */}
      {view === 'cart' && (
        <section className="mx-auto max-w-5xl px-5 pb-16 pt-10 sm:px-8 lg:px-10">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.18em] text-[#78aeba]">
                Оформлення замовлення
              </p>
              <h1 className="text-4xl font-medium tracking-[-0.05em] sm:text-5xl">
                Ваш кошик <span className="text-[#a3afb1]">({cartCount})</span>
              </h1>
            </div>
            <button
              onClick={() => setView('shop')}
              className="hidden text-sm text-[#718084] hover:text-[#183b46] md:block"
            >
              Продовжити покупки →
            </button>
          </div>

          {completedOrder ? (
            /* Екран успішно оформленого замовлення та звіту про відправку в Telegram */
            <div className="rounded-[28px] border border-[#bde5f0] bg-[#eff8fa] p-8 sm:p-12">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3.5 py-1.5 text-xs font-semibold text-emerald-800">
                <Check className="size-4" /> Замовлення #{completedOrder.order.id} успішно оформлено!
              </div>

              <h2 className="mt-4 text-3xl font-medium tracking-[-0.04em]">
                Дякуємо за покупку, {completedOrder.order.customerSnapshot.firstName}!
              </h2>

              <p className="mt-2 text-sm text-[#536268]">
                Інформацію про ваше замовлення та обрані товари відправлено до спеціального Telegram-бота магазину.
              </p>

              <div className="mt-6 grid gap-4 rounded-2xl bg-white p-5 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#78aeba]">
                    Дані отримувача
                  </p>
                  <p className="mt-1 font-medium">
                    {completedOrder.order.customerSnapshot.firstName}{' '}
                    {completedOrder.order.customerSnapshot.lastName}
                  </p>
                  <p className="text-xs text-[#536268]">
                    {completedOrder.order.customerSnapshot.phone} •{' '}
                    {completedOrder.order.customerSnapshot.email}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#78aeba]">
                    Адреса доставки
                  </p>
                  <p className="mt-1 font-medium">
                    {completedOrder.order.address.carrier === 'nova_poshta'
                      ? 'Нова Пошта'
                      : 'Укрпошта'}{' '}
                    — {completedOrder.order.address.city}
                  </p>
                  <p className="text-xs text-[#536268]">
                    {completedOrder.order.address.branch}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-[#d7e8eb] bg-white p-4 text-xs text-[#183b46]">
                <div className="flex items-center gap-2 font-semibold">
                  <Send className="size-3.5" /> Статус Telegram-бота:
                </div>
                <p className="mt-1 text-[#536268]">
                  {completedOrder.telegramMessage}
                </p>
              </div>

              <button
                onClick={() => {
                  setCompletedOrder(null)
                  setView('shop')
                }}
                className="mt-6 rounded-full bg-[#183b46] px-6 py-3 text-xs font-medium text-white"
              >
                Повернутися до магазину
              </button>
            </div>
          ) : detailedCartItems.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-[#cbd8da] p-16 text-center">
              <ShoppingBag className="mx-auto mb-4 size-8 text-[#8ebbc4]" />
              <p className="text-lg">Ваш кошик поки що порожній.</p>
              <button
                onClick={() => setView('shop')}
                className="mt-5 rounded-full bg-[#183b46] px-5 py-3 text-sm text-white"
              >
                Переглянути каталог одягу
              </button>
            </div>
          ) : (
            <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
              <div className="space-y-8">
                {/* Список товарів у кошику */}
                <div className="divide-y divide-[#e5e9e8] rounded-3xl border border-[#e5e9e8] bg-white p-5">
                  {detailedCartItems.map((entry) => (
                    <div
                      key={entry.key}
                      className="flex gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      <img
                        src={entry.product.image}
                        alt={entry.product.name}
                        className="size-24 rounded-2xl object-cover mix-blend-multiply"
                      />
                      <div className="flex flex-1 items-start justify-between gap-3">
                        <div>
                          <h2 className="font-medium text-[#1f3034]">
                            {entry.product.name}
                          </h2>
                          <p className="mt-0.5 text-xs text-[#536268]">
                            {CATEGORY_LABELS[entry.product.categoryType]} •{' '}
                            {GENDER_LABELS[entry.product.gender]} • Розмір:{' '}
                            <b className="text-[#183b46]">{entry.size}</b>
                          </p>
                          <p className="mt-1 text-sm font-semibold text-[#183b46]">
                            {entry.product.price} грн
                          </p>

                          <div className="mt-3 inline-flex items-center gap-3 rounded-full border border-[#dce2e2] px-2 py-1 text-xs">
                            <button
                              onClick={() => updateCartQuantity(entry.key, -1)}
                              aria-label="Зменшити кількість"
                              className="grid size-6 place-items-center rounded-full hover:bg-[#eff9fb]"
                            >
                              <Minus />
                            </button>
                            <span className="min-w-4 text-center font-medium">
                              {entry.quantity}
                            </span>
                            <button
                              onClick={() => updateCartQuantity(entry.key, 1)}
                              aria-label="Збільшити кількість"
                              className="grid size-6 place-items-center rounded-full hover:bg-[#eff9fb]"
                            >
                              <Plus />
                            </button>
                          </div>
                        </div>

                        <button
                          onClick={() =>
                            updateCartQuantity(entry.key, -entry.quantity)
                          }
                          aria-label="Видалити товар"
                          className="text-[#9aa6a8] hover:text-[#183b46]"
                        >
                          <X />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Блок вибору адреси доставки та кнопки «Додати іншу адресу» */}
                <div className="rounded-3xl border border-[#d7e8eb] bg-[#eff8fa] p-6">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h2 className="text-base font-semibold text-[#183b46]">
                        Адреса доставки (Нова Пошта / Укрпошта)
                      </h2>
                      <p className="text-xs text-[#536268]">
                        Оберіть збережену при реєстрації адресу або додайте іншу
                      </p>
                    </div>

                    {customer && (
                      <button
                        type="button"
                        onClick={() =>
                          setShowAddAnotherAddress(!showAddAnotherAddress)
                        }
                        className="flex items-center gap-1.5 rounded-full border border-[#183b46] bg-white px-3.5 py-2 text-xs font-semibold text-[#183b46] transition hover:bg-[#183b46] hover:text-white"
                      >
                        <Plus className="size-3.5" /> Додати іншу адресу
                      </button>
                    )}
                  </div>

                  {!customer ? (
                    <div className="rounded-2xl bg-white p-4 text-xs text-[#536268]">
                      <p className="mb-3">
                        Ви ще не зареєстровані. Для вибору адреси доставки та покупки необхідно пройти реєстрацію.
                      </p>
                      <button
                        onClick={() => setView('account')}
                        className="rounded-full bg-[#183b46] px-4 py-2 text-xs font-medium text-white"
                      >
                        Перейти до реєстрації
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {customer.addresses.length > 0 ? (
                        <div className="space-y-2">
                          {customer.addresses.map((addr) => (
                            <label
                              key={addr.id}
                              onClick={() => setSelectedAddressId(addr.id)}
                              className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 transition ${
                                selectedAddressId === addr.id
                                  ? 'border-[#183b46] bg-white shadow-2xs'
                                  : 'border-[#d7e8eb] bg-white/60 hover:bg-white'
                              }`}
                            >
                              <input
                                type="radio"
                                name="delivery_address"
                                checked={selectedAddressId === addr.id}
                                onChange={() => setSelectedAddressId(addr.id)}
                                className="mt-1 accent-[#183b46]"
                              />
                              <div className="text-xs">
                                <span className="inline-block rounded-md bg-[#eff8fa] px-2 py-0.5 font-semibold text-[#183b46]">
                                  {addr.carrier === 'nova_poshta'
                                    ? 'Нова Пошта'
                                    : 'Укрпошта'}
                                </span>
                                <p className="mt-1 font-medium text-[#1f3034]">
                                  {addr.city}
                                </p>
                                <p className="text-[#536268]">{addr.branch}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-[#536268]">
                          У вас ще немає збереженої адреси. Додайте адресу нижче:
                        </p>
                      )}

                      {/* Форма «Додати іншу адресу» з усіма відділеннями НП та Укрпошти */}
                      {(showAddAnotherAddress ||
                        customer.addresses.length === 0) && (
                        <div className="mt-4 rounded-2xl border border-[#78aeba] bg-white p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-[#183b46]">
                              Нова адреса доставки (Нова Пошта або Укрпошта)
                            </span>
                            {customer.addresses.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setShowAddAnotherAddress(false)}
                                className="text-xs text-[#829096] hover:text-[#1f3034]"
                              >
                                Скасувати
                              </button>
                            )}
                          </div>

                          <DeliveryAddressPicker
                            value={newCartAddress}
                            onChange={setNewCartAddress}
                            compact
                          />

                          <button
                            type="button"
                            disabled={savingAddress}
                            onClick={handleSaveAnotherAddress}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#183b46] py-2.5 text-xs font-medium text-white transition hover:bg-[#285865]"
                          >
                            <Check className="size-3.5" />
                            {savingAddress
                              ? 'Збереження адреси...'
                              : 'Зберегти та обрати цю адресу'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Підсумок замовлення та кнопка «Купити» */}
              <aside className="h-fit rounded-[24px] bg-[#eff8fa] p-6">
                <h2 className="mb-5 text-lg font-medium">Підсумок замовлення</h2>

                {customer && (
                  <div className="mb-4 rounded-xl bg-white p-3 text-xs">
                    <p className="font-semibold text-[#183b46]">
                      Покупець: {customer.firstName} {customer.lastName}
                    </p>
                    <p className="text-[#536268]">{customer.phone}</p>
                  </div>
                )}

                <div className="flex justify-between text-sm text-[#718084]">
                  <span>Товари ({cartCount} шт.)</span>
                  <span>{total} грн</span>
                </div>
                <div className="mt-3 flex justify-between text-sm text-[#718084]">
                  <span>Доставка</span>
                  <span>За тарифами перевізника</span>
                </div>

                <div className="my-6 border-t border-[#d7e8eb] pt-5">
                  <div className="flex justify-between text-base font-semibold">
                    <span>До сплати</span>
                    <span>{total} грн</span>
                  </div>
                </div>

                {checkoutError && (
                  <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-700">
                    {checkoutError}
                  </div>
                )}

                <button
                  onClick={handleBuyOrder}
                  disabled={checkoutLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#183b46] py-3.5 text-sm font-medium text-white transition hover:bg-[#245360] disabled:opacity-50"
                >
                  {checkoutLoading
                    ? 'Відправка в Telegram-бот...'
                    : 'Купити (Оформити замовлення)'}{' '}
                  <Check />
                </button>

                <p className="mt-3 text-center text-[11px] text-[#718084]">
                  Після натискання «Купити» замовлення миттєво надсилається в Telegram-бот.
                </p>
              </aside>
            </div>
          )}
        </section>
      )}

      {/* ==================== ЕКРАН 5: КЕРУВАННЯ ДВОМА БАЗАМИ ДАНИХ (DATABASES) ==================== */}
      {view === 'databases' && (
        <section className="mx-auto max-w-6xl px-5 pb-16 pt-8 sm:px-8 lg:px-10">
          <button
            onClick={() => setView('shop')}
            className="mb-6 flex items-center gap-2 text-sm text-[#718084] hover:text-[#183b46]"
          >
            <ArrowLeft /> Повернутися до вітрини
          </button>

          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#78aeba]">
              Cloudflare D1 / Локальне сховище
            </p>
            <h1 className="mt-1 text-3xl font-medium tracking-[-0.04em] sm:text-4xl">
              Панель керування двома базами даних
            </h1>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* БАЗА ДАНИХ №1: ПОКУПЦІ */}
            <div className="rounded-[28px] border border-[#d7e8eb] bg-[#eff8fa] p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <span className="rounded-full bg-[#183b46] px-3 py-1 text-[10px] font-semibold uppercase text-white">
                    База даних №1
                  </span>
                  <h2 className="mt-2 text-xl font-semibold text-[#183b46]">
                    База покупців ({allCustomersDb.length}) та Замовлень ({allOrdersDb.length})
                  </h2>
                </div>
              </div>

              {allCustomersDb.length === 0 ? (
                <p className="rounded-2xl bg-white p-4 text-xs text-[#536268]">
                  Поки що немає зареєстрованих покупців. Зареєструйтеся на вкладці «Реєстрація», щоб побачити запис тут.
                </p>
              ) : (
                <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
                  {allCustomersDb.map((cust) => (
                    <div
                      key={cust.id}
                      className="rounded-2xl border border-[#d7e8eb] bg-white p-4 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-[#183b46]">
                          {cust.firstName} {cust.lastName}
                        </span>
                        <span className="text-[10px] text-[#829096]">
                          ID: {cust.id}
                        </span>
                      </div>
                      <p className="text-[#536268]">
                        📞 <b>{cust.phone}</b> | ✉️ <b>{cust.email}</b>
                      </p>
                      {cust.googleAccount && (
                        <p className="text-[#183b46]">
                          🔵 Google: <b>{cust.googleAccount}</b>
                        </p>
                      )}
                      <div className="pt-1">
                        <span className="font-semibold text-[#536268]">
                          Адреси доставки ({cust.addresses.length}):
                        </span>
                        {cust.addresses.map((a) => (
                          <p key={a.id} className="text-[#1f3034]">
                            • [{a.carrier === 'nova_poshta' ? 'Нова Пошта' : 'Укрпошта'}] {a.city}, {a.branch}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* БАЗА ДАНИХ №2: ТОВАРИ */}
            <div className="rounded-[28px] border border-[#d7e8eb] bg-white p-6">
              <span className="rounded-full bg-[#78aeba] px-3 py-1 text-[10px] font-semibold uppercase text-white">
                База даних №2
              </span>
              <h2 className="mt-2 text-xl font-semibold text-[#183b46]">
                База товарів ({productsList.length}) — Додати новий товар
              </h2>

              <form onSubmit={handleCreateProduct} className="mt-4 space-y-3 text-xs">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block font-medium text-[#536268]">
                      Назва товару *
                    </label>
                    <input
                      type="text"
                      required
                      value={newProdName}
                      onChange={(e) => setNewProdName(e.target.value)}
                      placeholder="Напр. Вовняний светр"
                      className="w-full rounded-xl border border-[#dce2e2] px-3 py-2 outline-none focus:border-[#183b46]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-medium text-[#536268]">
                      Ціна (грн) *
                    </label>
                    <input
                      type="number"
                      required
                      value={newProdPrice}
                      onChange={(e) => setNewProdPrice(e.target.value)}
                      className="w-full rounded-xl border border-[#dce2e2] px-3 py-2 outline-none focus:border-[#183b46]"
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block font-medium text-[#536268]">
                      Вид товару *
                    </label>
                    <select
                      value={newProdCategory}
                      onChange={(e) => {
                        const val = e.target.value as ProductCategoryType
                        setNewProdCategory(val)
                        if (val === 'footwear') setNewProdSizes('38, 39, 40, 41, 42, 43')
                        else if (val === 'accessory') setNewProdSizes('One Size')
                        else setNewProdSizes('XS, S, M, L, XL')
                      }}
                      className="w-full rounded-xl border border-[#dce2e2] px-3 py-2 outline-none focus:border-[#183b46]"
                    >
                      <option value="upper_clothing">Верхній одяг</option>
                      <option value="lower_clothing">Нижній одяг</option>
                      <option value="footwear">Взуття</option>
                      <option value="accessory">Аксесуар</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block font-medium text-[#536268]">
                      Стать *
                    </label>
                    <select
                      value={newProdGender}
                      onChange={(e) =>
                        setNewProdGender(e.target.value as ProductGender)
                      }
                      className="w-full rounded-xl border border-[#dce2e2] px-3 py-2 outline-none focus:border-[#183b46]"
                    >
                      <option value="female">Жіночий</option>
                      <option value="male">Чоловічий</option>
                      <option value="unisex">Унісекс</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block font-medium text-[#536268]">
                      Матеріал *
                    </label>
                    <input
                      type="text"
                      required
                      value={newProdMaterial}
                      onChange={(e) => setNewProdMaterial(e.target.value)}
                      placeholder="100% Бавовна / Шкіра"
                      className="w-full rounded-xl border border-[#dce2e2] px-3 py-2 outline-none focus:border-[#183b46]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-medium text-[#536268]">
                      Розміри (через кому) *
                    </label>
                    <input
                      type="text"
                      required
                      value={newProdSizes}
                      onChange={(e) => setNewProdSizes(e.target.value)}
                      placeholder="38, 39, 40 або S, M, L"
                      className="w-full rounded-xl border border-[#dce2e2] px-3 py-2 outline-none focus:border-[#183b46]"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block font-medium text-[#536268]">
                    Опис товару *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={newProdDesc}
                    onChange={(e) => setNewProdDesc(e.target.value)}
                    placeholder="Детальний опис крою, особливостей та догляду..."
                    className="w-full rounded-xl border border-[#dce2e2] px-3 py-2 outline-none focus:border-[#183b46]"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-medium text-[#536268]">
                    URL фото (необов’язково)
                  </label>
                  <input
                    type="url"
                    value={newProdImage}
                    onChange={(e) => setNewProdImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full rounded-xl border border-[#dce2e2] px-3 py-2 outline-none focus:border-[#183b46]"
                  />
                </div>

                {prodCreateNotice && (
                  <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-800 font-medium">
                    {prodCreateNotice}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full rounded-full bg-[#183b46] py-2.5 font-medium text-white transition hover:bg-[#285865]"
                >
                  + Додати товар у Базу Даних №2
                </button>
              </form>

              <div className="mt-6 max-h-60 space-y-2 overflow-y-auto border-t border-[#e5e9e8] pt-4">
                {productsList.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-xl border border-[#e5e9e8] p-2.5 text-xs"
                  >
                    <div>
                      <p className="font-semibold text-[#1f3034]">
                        {p.name} — {p.price} грн
                      </p>
                      <p className="text-[11px] text-[#536268]">
                        {CATEGORY_LABELS[p.categoryType]} | {GENDER_LABELS[p.gender]} |{' '}
                        {p.material} | Розміри: {p.sizes.join(', ')}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteProduct(p.id)}
                      title="Видалити товар"
                      className="rounded-lg p-1.5 text-[#829096] hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <footer className="mx-auto flex max-w-6xl items-center justify-between border-t border-[#e5e9e8] px-5 py-7 text-xs text-[#98a3a6] sm:px-8 lg:px-10">
        <span>© 2026 mellow studio — Нова Пошта • Укрпошта • Telegram Bot</span>
        <span className="hidden sm:block">
          Готово до розгортання на Cloudflare Pages & D1
        </span>
      </footer>
    </main>
  )
}
