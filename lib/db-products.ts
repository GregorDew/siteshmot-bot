export type ProductCategoryType =
  | 'footwear'        // Взуття
  | 'accessory'       // Аксесуар
  | 'upper_clothing'  // Верхній одяг
  | 'lower_clothing'  // Нижній одяг

export type ProductGender =
  | 'female'          // Жіночий
  | 'male'            // Чоловічий
  | 'unisex'          // Унісекс

export interface ProductRecord {
  id: number
  name: string
  price: number
  description: string
  material: string
  categoryType: ProductCategoryType
  gender: ProductGender
  sizes: string[]
  image: string
  color: string
  createdAt: string
}

export const CATEGORY_LABELS: Record<ProductCategoryType, string> = {
  footwear: 'Взуття',
  accessory: 'Аксесуар',
  upper_clothing: 'Верхній одяг',
  lower_clothing: 'Нижній одяг',
}

export const GENDER_LABELS: Record<ProductGender, string> = {
  female: 'Жіночий',
  male: 'Чоловічий',
  unisex: 'Унісекс',
}

export const INITIAL_PRODUCTS: ProductRecord[] = [
  {
    id: 1,
    name: 'Washed Cotton Shirt / Бавовняна сорочка',
    price: 1850,
    description:
      'Вільна сорочка з м’якої праної бавовни для щоденного носіння. Дихаюча фактура тканини, класичний комір та перламутрові ґудзики.',
    material: '100% Органічна бавовна',
    categoryType: 'upper_clothing',
    gender: 'male',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    image:
      'https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=900&q=85',
    color: 'bg-[#e8eef0]',
    createdAt: '2026-11-01T10:00:00.000Z',
  },
  {
    id: 2,
    name: 'Soft Knit Cardigan / В’язаний кардиган',
    price: 2950,
    description:
      'Затишний кардиган вільного крою з ніжної пряжі. Ідеальний верхній шар для прохолодних вечорів, не колеться та тримає форму.',
    material: '70% Мериносова вовна, 30% Кашемір',
    categoryType: 'upper_clothing',
    gender: 'female',
    sizes: ['XS', 'S', 'M', 'L'],
    image:
      'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=900&q=85',
    color: 'bg-[#f0e8df]',
    createdAt: '2026-11-02T10:00:00.000Z',
  },
  {
    id: 3,
    name: 'Relaxed Wool Coat / Вовняне пальто оверсайз',
    price: 6400,
    description:
      'Демісезонне пальто прямого силуету з натуральної вовни з підкладкою із віскози. Захищає від вітру та зберігає тепло.',
    material: '80% Натуральна вовна, 20% Поліамід',
    categoryType: 'upper_clothing',
    gender: 'female',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    image:
      'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=900&q=85',
    color: 'bg-[#e4e9e8]',
    createdAt: '2026-11-03T10:00:00.000Z',
  },
  {
    id: 4,
    name: 'Everyday Leather Loafer / Шкіряні лофери',
    price: 4200,
    description:
      'Мінімалістичні лофери ручної роботи з м’якої телячої шкіри. Анатомічна устілка та зносостійка гумова підошва для комфорту протягом усього дня.',
    material: '100% Натуральна теляча шкіра',
    categoryType: 'footwear',
    gender: 'unisex',
    sizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44'],
    image: '/images/everyday-leather-loafer.png',
    color: 'bg-[#eee4d8]',
    createdAt: '2026-11-04T10:00:00.000Z',
  },
  {
    id: 5,
    name: 'Canvas Weekender / Дорожня сумка з канвасу',
    price: 2450,
    description:
      'Містка сумка з щільного вощеного канвасу та шкіряними ручками. Має відділення для ноутбука та внутрішню кишеню на блискавці.',
    material: 'Вощений бавовняний канвас + шкіряні вставки',
    categoryType: 'accessory',
    gender: 'unisex',
    sizes: ['One Size'],
    image:
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85',
    color: 'bg-[#e8edf0]',
    createdAt: '2026-11-05T10:00:00.000Z',
  },
  {
    id: 6,
    name: 'Ribbed Wool Scarf / Фактурний вовняний шарф',
    price: 1350,
    description:
      'Об’ємний шарф фактурної в’язки в рубчик. М’яко огортає шию та додає мінімалістичного акценту будь-якому образу.',
    material: '100% Вовна альпаки та мериноса',
    categoryType: 'accessory',
    gender: 'unisex',
    sizes: ['One Size'],
    image:
      'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&w=900&q=85',
    color: 'bg-[#f0e8df]',
    createdAt: '2026-11-06T10:00:00.000Z',
  },
  {
    id: 7,
    name: 'Pleated Wide Trousers / Класичні широкі штани',
    price: 2680,
    description:
      'Штани вільного крою з защипами на талії. Гарно спадають, не мнуться та поєднуються як із кедами, так і з лоферами.',
    material: '65% Віскоза, 30% Вовна, 5% Еластан',
    categoryType: 'lower_clothing',
    gender: 'female',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    image:
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=85',
    color: 'bg-[#e8eef0]',
    createdAt: '2026-11-07T10:00:00.000Z',
  },
  {
    id: 8,
    name: 'Relaxed Selvedge Jeans / Прямі джинси денім',
    price: 2890,
    description:
      'Класичні чоловічі джинси прямого крою з щільного японського деніму. З часом набувають індивідуальної посадки.',
    material: '100% Щільний бавовняний денім (13.5 oz)',
    categoryType: 'lower_clothing',
    gender: 'male',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    image:
      'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=85',
    color: 'bg-[#e4e9e8]',
    createdAt: '2026-11-08T10:00:00.000Z',
  },
  {
    id: 9,
    name: 'Suede Chelsea Boots / Замшеві челсі',
    price: 4850,
    description:
      'Черевики челсі з натуральної водовідштовхувальної замші з еластичними боковими вставками та міцною підошвою.',
    material: '100% Натуральна замша, шкіряна підкладка',
    categoryType: 'footwear',
    gender: 'male',
    sizes: ['40', '41', '42', '43', '44', '45'],
    image:
      'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=900&q=85',
    color: 'bg-[#f0e8df]',
    createdAt: '2026-11-09T10:00:00.000Z',
  },
]

// Глобальне сховище для БД №2 (Товари), яке підтримує Cloudflare D1 або In-Memory/JSON
const globalForProducts = globalThis as unknown as {
  __PRODUCTS_DB__?: ProductRecord[]
}

function getMemoryStore(): ProductRecord[] {
  if (!globalForProducts.__PRODUCTS_DB__) {
    globalForProducts.__PRODUCTS_DB__ = [...INITIAL_PRODUCTS]
  }
  return globalForProducts.__PRODUCTS_DB__
}

export async function getAllProducts(): Promise<ProductRecord[]> {
  return getMemoryStore()
}

export async function createProductInDb(
  input: Omit<ProductRecord, 'id' | 'createdAt'>
): Promise<ProductRecord> {
  const current = await getAllProducts()
  const nextId = current.reduce((max, item) => Math.max(max, item.id), 0) + 1
  const newProduct: ProductRecord = {
    ...input,
    id: nextId,
    createdAt: new Date().toISOString(),
  }
  const updated = [newProduct, ...current]
  globalForProducts.__PRODUCTS_DB__ = updated
  return newProduct
}

export async function deleteProductFromDb(id: number): Promise<boolean> {
  const current = await getAllProducts()
  const updated = current.filter((p) => p.id !== id)
  globalForProducts.__PRODUCTS_DB__ = updated
  return true
}
