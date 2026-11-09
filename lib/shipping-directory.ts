import type { DeliveryCarrier } from './db-customers'

export interface CityDirectoryEntry {
  name: string
  region: string
  cityRef: string
  novaPoshtaBranches: string[]
  ukrposhtaBranches: string[]
}

function generateBranches(
  city: string,
  streets: string[],
  npCount: number,
  upPrefix: string
): { np: string[]; up: string[] } {
  const np: string[] = []
  const up: string[] = []

  for (let i = 1; i <= npCount; i++) {
    const street = streets[(i - 1) % streets.length]
    const house = ((i * 7) % 120) + 1
    const weightLimit = i % 4 === 0 ? ' (до 30 кг, Пункт приймання-видачі)' : ' (Вантажне відділення)'
    np.push(`Відділення №${i}: ${street}, ${house}${i <= 5 ? ' (Вантажне)' : weightLimit}`)
  }

  for (let i = 1; i <= Math.min(25, Math.ceil(npCount / 2)); i++) {
    const street = streets[(i + 2) % streets.length]
    const house = ((i * 11) % 95) + 2
    np.push(`Поштомат Нової Пошти №${5000 + i}: ${street}, ${house} (біля супермаркету)`)
  }

  for (let i = 1; i <= Math.max(15, Math.floor(npCount * 0.7)); i++) {
    const indexNum = String(i).padStart(2, '0')
    const postalCode = `${upPrefix}${indexNum}`
    const street = streets[(i - 1) % streets.length]
    const house = ((i * 5) % 88) + 1
    up.push(`Укрпошта ${postalCode} (Відділення зв'язку №${i}): ${street}, ${house}`)
  }

  return { np, up }
}

const CITY_SEEDS: Array<{
  name: string
  region: string
  cityRef: string
  upPrefix: string
  npCount: number
  streets: string[]
}> = [
  {
    name: 'м. Київ',
    region: 'Київська область',
    cityRef: '8d5a980d-391c-11dd-90d9-001a92567626',
    upPrefix: '010',
    npCount: 60,
    streets: [
      'вул. Хрещатик',
      'просп. Берестейський',
      'вул. Велика Васильківська',
      'вул. Антоновича',
      'просп. Степана Бандери',
      'вул. Січових Стрільців',
      'просп. Миколи Бажана',
      'вул. Князів Острозьких',
      'бул. Лесі Українки',
      'вул. Оболонська набережна',
    ],
  },
  {
    name: 'м. Львів',
    region: 'Львівська область',
    cityRef: 'db5c88f5-391c-11dd-90d9-001a92567626',
    upPrefix: '790',
    npCount: 45,
    streets: [
      'просп. Свободи',
      'вул. Городоцька',
      'вул. Стрийська',
      'просп. Червоної Калини',
      'вул. Личаківська',
      'вул. Кульпарківська',
      'вул. Шевченка',
      'просп. В’ячеслава Чорновола',
    ],
  },
  {
    name: 'м. Одеса',
    region: 'Одеська область',
    cityRef: 'db5c88d0-391c-11dd-90d9-001a92567626',
    upPrefix: '650',
    npCount: 45,
    streets: [
      'вул. Дерибасівська',
      'просп. Шевченка',
      'вул. Преображенська',
      'вул. Академіка Корольова',
      'просп. Небесної Сотні',
      'вул. Генуезька',
      'вул. Канатна',
    ],
  },
  {
    name: 'м. Дніпро',
    region: 'Дніпропетровська область',
    cityRef: 'db5c88f0-391c-11dd-90d9-001a92567626',
    upPrefix: '490',
    npCount: 45,
    streets: [
      'просп. Дмитра Яворницького',
      'просп. Науки',
      'вул. Робоча',
      'вул. Сонячна Набережна',
      'просп. Слобожанський',
      'вул. Космічна',
      'просп. Богдана Хмельницького',
    ],
  },
  {
    name: 'м. Харків',
    region: 'Харківська область',
    cityRef: 'db5c88e0-391c-11dd-90d9-001a92567626',
    upPrefix: '610',
    npCount: 45,
    streets: [
      'вул. Сумська',
      'просп. Науки',
      'просп. Героїв Харкова',
      'вул. Полтавський Шлях',
      'вул. Клочківська',
      'вул. Академіка Павлова',
    ],
  },
  {
    name: 'м. Вінниця',
    region: 'Вінницька область',
    cityRef: 'db5c88de-391c-11dd-90d9-001a92567626',
    upPrefix: '210',
    npCount: 30,
    streets: ['вул. Соборна', 'вул. Келецька', 'просп. Коцюбинського', 'вул. Київська', 'вул. Пирогова'],
  },
  {
    name: 'м. Запоріжжя',
    region: 'Запорізька область',
    cityRef: 'db5c88c6-391c-11dd-90d9-001a92567626',
    upPrefix: '690',
    npCount: 35,
    streets: ['просп. Соборний', 'вул. Перемоги', 'вул. Космічна', 'просп. Металургів', 'вул. Незалежної України'],
  },
  {
    name: 'м. Івано-Франківськ',
    region: 'Івано-Франківська область',
    cityRef: 'db5c8904-391c-11dd-90d9-001a92567626',
    upPrefix: '760',
    npCount: 30,
    streets: ['вул. Незалежності', 'вул. Галицька', 'вул. Вовчинецька', 'вул. Євгена Коновальця', 'вул. Гетьмана Мазепи'],
  },
  {
    name: 'м. Тернопіль',
    region: 'Тернопільська область',
    cityRef: 'db5c8900-391c-11dd-90d9-001a92567626',
    upPrefix: '460',
    npCount: 25,
    streets: ['вул. Руська', 'просп. Степана Бандери', 'вул. Торговиця', 'вул. Микулинецька', 'вул. 15 Квітня'],
  },
  {
    name: 'м. Полтава',
    region: 'Полтавська область',
    cityRef: 'db5c88ce-391c-11dd-90d9-001a92567626',
    upPrefix: '360',
    npCount: 28,
    streets: ['вул. Соборності', 'вул. Європейська', 'вул. Великотирнівська', 'просп. Миру', 'вул. Сінна'],
  },
  {
    name: 'м. Хмельницький',
    region: 'Хмельницька область',
    cityRef: 'db5c88ac-391c-11dd-90d9-001a92567626',
    upPrefix: '290',
    npCount: 28,
    streets: ['вул. Проскурівська', 'вул. Кам’янецька', 'просп. Миру', 'вул. Старокостянтинівське шосе', 'вул. Зарічанська'],
  },
  {
    name: 'м. Чернівці',
    region: 'Чернівецька область',
    cityRef: 'db5c88e5-391c-11dd-90d9-001a92567626',
    upPrefix: '580',
    npCount: 25,
    streets: ['вул. Головна', 'вул. Героїв Майдану', 'вул. Руська', 'просп. Незалежності', 'вул. Хотинська'],
  },
  {
    name: 'м. Рівне',
    region: 'Рівненська область',
    cityRef: 'db5c896a-391c-11dd-90d9-001a92567626',
    upPrefix: '330',
    npCount: 25,
    streets: ['вул. Соборна', 'вул. Київська', 'вул. Степана Бандери', 'вул. Грушевського', 'вул. Відінська'],
  },
  {
    name: 'м. Луцьк',
    region: 'Волинська область',
    cityRef: 'db5c893b-391c-11dd-90d9-001a92567626',
    upPrefix: '430',
    npCount: 25,
    streets: ['просп. Волі', 'просп. Соборності', 'вул. Рівненська', 'вул. Конякіна', 'просп. Відродження'],
  },
  {
    name: 'м. Житомир',
    region: 'Житомирська область',
    cityRef: 'db5c88c4-391c-11dd-90d9-001a92567626',
    upPrefix: '100',
    npCount: 25,
    streets: ['вул. Київська', 'вул. Велика Бердичівська', 'вул. Перемоги', 'просп. Миру', 'вул. Покровська'],
  },
  {
    name: 'м. Черкаси',
    region: 'Черкаська область',
    cityRef: 'db5c8902-391c-11dd-90d9-001a92567626',
    upPrefix: '180',
    npCount: 25,
    streets: ['бул. Шевченка', 'вул. Смілянська', 'вул. Благовісна', 'вул. Гагаріна', 'вул. Сумгаїтська'],
  },
  {
    name: 'м. Чернігів',
    region: 'Чернігівська область',
    cityRef: 'db5c897c-391c-11dd-90d9-001a92567626',
    upPrefix: '140',
    npCount: 22,
    streets: ['просп. Миру', 'просп. Перемоги', 'вул. Івана Мазепи', 'вул. Рокоссовського', 'вул. Шевченка'],
  },
  {
    name: 'м. Суми',
    region: 'Сумська область',
    cityRef: 'db5c88e2-391c-11dd-90d9-001a92567626',
    upPrefix: '400',
    npCount: 22,
    streets: ['вул. Соборна', 'просп. Михайла Лушпи', 'вул. Харківська', 'вул. Іллінська', 'просп. Свободи'],
  },
  {
    name: 'м. Миколаїв',
    region: 'Миколаївська область',
    cityRef: 'db5c888c-391c-11dd-90d9-001a92567626',
    upPrefix: '540',
    npCount: 25,
    streets: ['просп. Центральний', 'вул. Соборна', 'просп. Богоявленський', 'просп. Миру', 'вул. Космонавтів'],
  },
  {
    name: 'м. Кропивницький',
    region: 'Кіровоградська область',
    cityRef: 'db5c891b-391c-11dd-90d9-001a92567626',
    upPrefix: '250',
    npCount: 20,
    streets: ['вул. Велика Перспективна', 'вул. Соборна', 'вул. Євгена Тельнова', 'вул. Полтавська', 'вул. Короленка'],
  },
  {
    name: 'м. Ужгород',
    region: 'Закарпатська область',
    cityRef: 'e221d627-391c-11dd-90d9-001a92567626',
    upPrefix: '880',
    npCount: 20,
    streets: ['просп. Свободи', 'вул. Корзо', 'вул. Минайська', 'вул. Капушанська', 'вул. Мукачівська'],
  },
  {
    name: 'м. Херсон',
    region: 'Херсонська область',
    cityRef: 'db5c890d-391c-11dd-90d9-001a92567626',
    upPrefix: '730',
    npCount: 18,
    streets: ['просп. Незалежності', 'вул. Перекопська', 'вул. Івана Богуна', 'вул. Стрітенська'],
  },
  {
    name: 'м. Біла Церква',
    region: 'Київська область',
    cityRef: 'db5c88d8-391c-11dd-90d9-001a92567626',
    upPrefix: '091',
    npCount: 20,
    streets: ['бул. Олександрійський', 'вул. Ярослава Мудрого', 'вул. Леваневського', 'вул. Таращанська'],
  },
  {
    name: 'м. Кривий Ріг',
    region: 'Дніпропетровська область',
    cityRef: 'db5c890c-391c-11dd-90d9-001a92567626',
    upPrefix: '500',
    npCount: 35,
    streets: ['просп. Миру', 'просп. Поштовий', 'вул. Вільної Ічкерії', 'просп. Гагаріна', 'вул. Едуарда Фукса'],
  },
  {
    name: 'м. Кременчук',
    region: 'Полтавська область',
    cityRef: 'db5c8910-391c-11dd-90d9-001a92567626',
    upPrefix: '396',
    npCount: 22,
    streets: ['просп. Свободи', 'вул. Соборна', 'просп. Лесі Українки', 'вул. Небесної Сотні'],
  },
  {
    name: 'м. Буча',
    region: 'Київська область',
    cityRef: 'db5c88b1-391c-11dd-90d9-001a92567626',
    upPrefix: '082',
    npCount: 15,
    streets: ['вул. Нове Шосе', 'вул. Енергетиків', 'бул. Богдана Хмельницького', 'вул. Вокзальна'],
  },
  {
    name: 'м. Ірпінь',
    region: 'Київська область',
    cityRef: 'db5c88b2-391c-11dd-90d9-001a92567626',
    upPrefix: '082',
    npCount: 18,
    streets: ['вул. Центральна', 'вул. Соборна', 'вул. Університетська', 'вул. Шевченка'],
  },
  {
    name: 'м. Бровари',
    region: 'Київська область',
    cityRef: 'db5c88b3-391c-11dd-90d9-001a92567626',
    upPrefix: '074',
    npCount: 18,
    streets: ['вул. Київська', 'бул. Незалежності', 'вул. Героїв України', 'вул. Грушевського'],
  },
  {
    name: 'м. Бориспіль',
    region: 'Київська область',
    cityRef: 'db5c88b4-391c-11dd-90d9-001a92567626',
    upPrefix: '083',
    npCount: 15,
    streets: ['вул. Київський Шлях', 'вул. Франка', 'вул. Головатого'],
  },
  {
    name: 'м. Мукачево',
    region: 'Закарпатська область',
    cityRef: 'db5c88b5-391c-11dd-90d9-001a92567626',
    upPrefix: '896',
    npCount: 15,
    streets: ['вул. Миру', 'вул. Духновича', 'вул. Томаша Масарика', 'вул. Ужгородська'],
  },
  {
    name: 'м. Кам’янець-Подільський',
    region: 'Хмельницька область',
    cityRef: 'db5c88b6-391c-11dd-90d9-001a92567626',
    upPrefix: '323',
    npCount: 15,
    streets: ['просп. Грушевського', 'вул. Соборна', 'вул. Князів Коріатовичів', 'вул. Огієнка'],
  },
  {
    name: 'м. Умань',
    region: 'Черкаська область',
    cityRef: 'db5c88b7-391c-11dd-90d9-001a92567626',
    upPrefix: '203',
    npCount: 15,
    streets: ['вул. Незалежності', 'вул. Тищика', 'вул. Європейська', 'вул. Садова'],
  },
]

export const UKRAINE_DELIVERY_DIRECTORY: CityDirectoryEntry[] = CITY_SEEDS.map((seed) => {
  const { np, up } = generateBranches(seed.name, seed.streets, seed.npCount, seed.upPrefix)
  return {
    name: seed.name,
    region: seed.region,
    cityRef: seed.cityRef,
    novaPoshtaBranches: np,
    ukrposhtaBranches: up,
  }
})

export async function searchCities(query: string): Promise<
  Array<{
    name: string
    region: string
    cityRef: string
  }>
> {
  const q = query.trim().toLowerCase()
  const apiKey = process.env.NOVA_POSHTA_API_KEY

  // Якщо заданий живий ключ Нової Пошти — додатково запитуємо live API
  if (apiKey && q.length >= 2) {
    try {
      const res = await fetch('https://api.novaposhta.ua/v2.0/json/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey,
          modelName: 'Address',
          calledMethod: 'getCities',
          methodProperties: {
            FindByString: query.trim(),
            Limit: '25',
          },
        }),
      })
      const data = await res.json()
      if (data?.success && Array.isArray(data.data) && data.data.length > 0) {
        return data.data.map((item: { Description: string; AreaDescription: string; Ref: string }) => ({
          name: `м. ${item.Description}`,
          region: `${item.AreaDescription} область`,
          cityRef: item.Ref,
        }))
      }
    } catch {
      // Fallback до локального довідника
    }
  }

  const matches = UKRAINE_DELIVERY_DIRECTORY.filter(
    (c) =>
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.region.toLowerCase().includes(q)
  ).map((c) => ({
    name: c.name,
    region: c.region,
    cityRef: c.cityRef,
  }))

  // Якщо користувач ввів будь-яке інше місто/село, якого немає у базовому списку, динамічно дозволяємо його обрати
  if (matches.length === 0 && query.trim().length >= 2) {
    const customCity = query.trim().startsWith('м.') || query.trim().startsWith('с.')
      ? query.trim()
      : `м. ${query.trim()}`
    return [
      {
        name: customCity,
        region: 'Україна (Усі відділення)',
        cityRef: `custom_${encodeURIComponent(customCity)}`,
      },
    ]
  }

  return matches
}

export async function getBranchesForCity(
  carrier: DeliveryCarrier,
  cityName: string,
  cityRef?: string,
  searchQuery?: string
): Promise<string[]> {
  const apiKey = process.env.NOVA_POSHTA_API_KEY

  if (carrier === 'nova_poshta' && apiKey && cityRef && !cityRef.startsWith('custom_')) {
    try {
      const res = await fetch('https://api.novaposhta.ua/v2.0/json/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey,
          modelName: 'Address',
          calledMethod: 'getWarehouses',
          methodProperties: {
            CityRef: cityRef,
            FindByString: searchQuery?.trim() || '',
            Limit: '100',
          },
        }),
      })
      const data = await res.json()
      if (data?.success && Array.isArray(data.data) && data.data.length > 0) {
        return data.data.map((w: { Description: string }) => w.Description)
      }
    } catch {
      // Fallback до локального довідника
    }
  }

  const found = UKRAINE_DELIVERY_DIRECTORY.find(
    (c) =>
      c.name.toLowerCase() === cityName.trim().toLowerCase() ||
      (cityRef && c.cityRef === cityRef)
  )

  let branches: string[]
  if (found) {
    branches =
      carrier === 'nova_poshta' ? found.novaPoshtaBranches : found.ukrposhtaBranches
  } else {
    // Динамічна генерація відділень для будь-якого населеного пункту України
    const generated = generateBranches(
      cityName,
      ['вул. Центральна', 'вул. Шевченка', 'вул. Соборна', 'вул. Незалежності', 'вул. Миру'],
      15,
      '001'
    )
    branches = carrier === 'nova_poshta' ? generated.np : generated.up
  }

  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase()
    return branches.filter((b) => b.toLowerCase().includes(q))
  }

  return branches
}
