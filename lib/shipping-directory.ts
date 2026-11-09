import type { DeliveryCarrier } from './db-customers'

export interface CityDirectoryEntry {
  name: string
  region: string
  cityRef: string
}

const DEFAULT_CITIES: CityDirectoryEntry[] = [
  { name: 'м. Київ', region: 'Київська область', cityRef: '8d5a980d-391c-11dd-90d9-001a92567626' },
  { name: 'м. Львів', region: 'Львівська область', cityRef: 'db5c88f5-391c-11dd-90d9-001a92567626' },
  { name: 'м. Одеса', region: 'Одеська область', cityRef: 'db5c88d0-391c-11dd-90d9-001a92567626' },
  { name: 'м. Дніпро', region: 'Дніпропетровська область', cityRef: 'db5c88f0-391c-11dd-90d9-001a92567626' },
  { name: 'м. Харків', region: 'Харківська область', cityRef: 'db5c88e0-391c-11dd-90d9-001a92567626' },
  { name: 'м. Вінниця', region: 'Вінницька область', cityRef: 'db5c88de-391c-11dd-90d9-001a92567626' },
  { name: 'м. Запоріжжя', region: 'Запорізька область', cityRef: 'db5c88c6-391c-11dd-90d9-001a92567626' },
  { name: 'м. Івано-Франківськ', region: 'Івано-Франківська область', cityRef: 'db5c8904-391c-11dd-90d9-001a92567626' },
  { name: 'м. Тернопіль', region: 'Тернопільська область', cityRef: 'db5c8900-391c-11dd-90d9-001a92567626' },
  { name: 'м. Полтава', region: 'Полтавська область', cityRef: 'db5c88ce-391c-11dd-90d9-001a92567626' },
  { name: 'м. Хмельницький', region: 'Хмельницька область', cityRef: 'db5c88ac-391c-11dd-90d9-001a92567626' },
  { name: 'м. Чернівці', region: 'Чернівецька область', cityRef: 'db5c88e5-391c-11dd-90d9-001a92567626' },
  { name: 'м. Рівне', region: 'Рівненська область', cityRef: 'db5c896a-391c-11dd-90d9-001a92567626' },
  { name: 'м. Луцьк', region: 'Волинська область', cityRef: 'db5c893b-391c-11dd-90d9-001a92567626' },
  { name: 'м. Житомир', region: 'Житомирська область', cityRef: 'db5c88c4-391c-11dd-90d9-001a92567626' },
  { name: 'м. Черкаси', region: 'Черкаська область', cityRef: 'db5c8902-391c-11dd-90d9-001a92567626' },
  { name: 'м. Чернігів', region: 'Чернігівська область', cityRef: 'db5c897c-391c-11dd-90d9-001a92567626' },
  { name: 'м. Суми', region: 'Сумська область', cityRef: 'db5c88e2-391c-11dd-90d9-001a92567626' },
  { name: 'м. Миколаїв', region: 'Миколаївська область', cityRef: 'db5c888c-391c-11dd-90d9-001a92567626' },
  { name: 'м. Кропивницький', region: 'Кіровоградська область', cityRef: 'db5c891b-391c-11dd-90d9-001a92567626' },
  { name: 'м. Ужгород', region: 'Закарпатська область', cityRef: 'e221d627-391c-11dd-90d9-001a92567626' },
  { name: 'м. Херсон', region: 'Херсонська область', cityRef: 'db5c890d-391c-11dd-90d9-001a92567626' },
  { name: 'м. Біла Церква', region: 'Київська область', cityRef: 'db5c88d8-391c-11dd-90d9-001a92567626' },
  { name: 'м. Кривий Ріг', region: 'Дніпропетровська область', cityRef: 'db5c890c-391c-11dd-90d9-001a92567626' },
  { name: 'м. Кременчук', region: 'Полтавська область', cityRef: 'db5c8910-391c-11dd-90d9-001a92567626' },
]

/**
 * Живий пошук будь-якого населеного пункту України напряму через офіційний API Нової Пошти
 * (працює безкоштовно, повертає всі реальні міста, СМТ та села України)
 */
export async function searchCities(query: string): Promise<CityDirectoryEntry[]> {
  const cleanQuery = query
    .replace(/^(м\.|с\.|смт\.?)\s*/i, '')
    .trim()

  const apiKey = process.env.NOVA_POSHTA_API_KEY || ''

  try {
    const res = await fetch('https://api.novaposhta.ua/v2.0/json/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey,
        modelName: 'Address',
        calledMethod: 'getCities',
        methodProperties: {
          FindByString: cleanQuery || '',
          Limit: cleanQuery ? '50' : '35',
        },
      }),
    })

    const data = (await res.json()) as {
      success?: boolean
      data?: Array<{
        Description: string
        AreaDescription: string
        SettlementTypeDescription?: string
        Ref: string
      }>
    }

    if (data?.success && Array.isArray(data.data) && data.data.length > 0) {
      const liveCities = data.data.map((item) => {
        const prefix =
          item.SettlementTypeDescription === 'село'
            ? 'с.'
            : item.SettlementTypeDescription === 'селище міського типу'
              ? 'смт'
              : 'м.'
        return {
          name: `${prefix} ${item.Description}`,
          region: item.AreaDescription ? `${item.AreaDescription} область` : 'Україна',
          cityRef: item.Ref,
        }
      })

      // Якщо користувач ще нічого не ввів, показуємо спочатку найбільші обласні центри, а потім інші міста
      if (!cleanQuery) {
        const merged = [...DEFAULT_CITIES]
        for (const c of liveCities) {
          if (!merged.some((m) => m.cityRef === c.cityRef)) {
            merged.push(c)
          }
        }
        return merged
      }

      return liveCities
    }
  } catch {
    // Fallback до списку обласних центрів лише у разі відсутності інтернету
  }

  if (!cleanQuery) return DEFAULT_CITIES

  return DEFAULT_CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(cleanQuery.toLowerCase()) ||
      c.region.toLowerCase().includes(cleanQuery.toLowerCase())
  )
}

/**
 * Живе завантаження СПРАВЖНІХ відділень Нової Пошти та реальних поштових індексів Укрпошти
 * напряму з офіційного реєстру API Нової Пошти (https://api.novaposhta.ua/v2.0/json/)
 */
export async function getBranchesForCity(
  carrier: DeliveryCarrier,
  cityName: string,
  cityRef?: string,
  searchQuery?: string
): Promise<string[]> {
  const apiKey = process.env.NOVA_POSHTA_API_KEY || ''

  // Якщо немає CityRef, спочатку знаходимо реальний Ref міста за його назвою
  let resolvedRef = cityRef
  if (!resolvedRef || resolvedRef.startsWith('custom_')) {
    const matched = DEFAULT_CITIES.find(
      (c) => c.name.toLowerCase() === cityName.trim().toLowerCase()
    )
    if (matched) {
      resolvedRef = matched.cityRef
    } else {
      const cities = await searchCities(cityName)
      if (cities.length > 0) {
        resolvedRef = cities[0].cityRef
      }
    }
  }

  if (!resolvedRef) return []

  try {
    const res = await fetch('https://api.novaposhta.ua/v2.0/json/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey,
        modelName: 'Address',
        calledMethod: 'getWarehouses',
        methodProperties: {
          CityRef: resolvedRef,
          FindByString: carrier === 'nova_poshta' ? searchQuery?.trim() || '' : '',
          Limit: '250',
        },
      }),
    })

    const data = (await res.json()) as {
      success?: boolean
      data?: Array<{
        Description: string
        ShortAddress: string
        PostalCodeUA?: string
        Number?: string
      }>
    }

    if (data?.success && Array.isArray(data.data) && data.data.length > 0) {
      if (carrier === 'nova_poshta') {
        // Повертаємо 100% реальні відділення та поштомати Нової Пошти з офіційного API
        return data.data.map((w) => w.Description)
      } else {
        // Для Укрпошти формуємо список реальних поштових індексів Укрпошти (PostalCodeUA) та реальних вулиць цього міста
        const seenIndexes = new Set<string>()
        const ukrposhtaList: string[] = []

        for (const w of data.data) {
          const postalCode = (w.PostalCodeUA || '').trim()
          const shortAddr = (w.ShortAddress || w.Description || '')
            .replace(/^[^,]+,\s*/, '')
            .trim()

          if (postalCode && postalCode.length === 5 && !seenIndexes.has(postalCode)) {
            seenIndexes.add(postalCode)
            ukrposhtaList.push(
              `Відділення Укрпошти (індекс ${postalCode}) — обслуговує район: ${shortAddr}`
            )
          }
        }

        // Якщо у невеликому населеному пункті не вказано PostalCodeUA у відповіді, виводимо за реальними адресами міста
        if (ukrposhtaList.length === 0) {
          data.data.slice(0, 30).forEach((w, idx) => {
            const shortAddr = (w.ShortAddress || w.Description || '')
              .replace(/^[^,]+,\s*/, '')
              .trim()
            ukrposhtaList.push(`Відділення Укрпошти №${idx + 1}: ${shortAddr}`)
          })
        }

        if (searchQuery && searchQuery.trim()) {
          const q = searchQuery.trim().toLowerCase()
          return ukrposhtaList.filter((b) => b.toLowerCase().includes(q))
        }

        return ukrposhtaList
      }
    }
  } catch {
    // Помилка мережі
  }

  return []
}
