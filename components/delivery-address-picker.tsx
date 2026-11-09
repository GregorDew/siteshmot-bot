'use client'

import { useEffect, useState } from 'react'
import { MapPin, Search, Truck } from 'lucide-react'
import type { DeliveryCarrier } from '@/lib/db-customers'

export interface SelectedAddressValue {
  carrier: DeliveryCarrier
  city: string
  cityRef?: string
  branch: string
}

interface DeliveryAddressPickerProps {
  value: SelectedAddressValue
  onChange: (next: SelectedAddressValue) => void
  compact?: boolean
}

export function DeliveryAddressPicker({
  value,
  onChange,
  compact = false,
}: DeliveryAddressPickerProps) {
  const [cityQuery, setCityQuery] = useState('')
  const [cities, setCities] = useState<
    Array<{ name: string; region: string; cityRef: string }>
  >([])
  const [branchQuery, setBranchQuery] = useState('')
  const [branches, setBranches] = useState<string[]>([])
  const [loadingBranches, setLoadingBranches] = useState(false)

  useEffect(() => {
    let active = true
    const controller = new AbortController()

    fetch(`/api/shipping?type=cities&q=${encodeURIComponent(cityQuery)}`, {
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((data) => {
        if (active && Array.isArray(data.cities)) {
          setCities(data.cities)
        }
      })
      .catch(() => {})

    return () => {
      active = false
      controller.abort()
    }
  }, [cityQuery])

  useEffect(() => {
    if (!value.city) {
      setBranches([])
      return
    }
    let active = true
    setLoadingBranches(true)
    fetch(
      `/api/shipping?type=branches&carrier=${value.carrier}&city=${encodeURIComponent(
        value.city
      )}&cityRef=${encodeURIComponent(value.cityRef || '')}&q=${encodeURIComponent(
        branchQuery
      )}`
    )
      .then((r) => r.json())
      .then((data) => {
        if (active && Array.isArray(data.branches)) {
          setBranches(data.branches)
          if (data.branches.length > 0 && !data.branches.includes(value.branch)) {
            onChange({
              ...value,
              branch: data.branches[0],
            })
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoadingBranches(false)
      })

    return () => {
      active = false
    }
  }, [value.carrier, value.city, value.cityRef, branchQuery])

  const switchCarrier = (carrier: DeliveryCarrier) => {
    onChange({
      ...value,
      carrier,
      branch: '',
    })
  }

  const handleCitySelect = (cityName: string) => {
    const matched = cities.find((c) => c.name === cityName)
    onChange({
      ...value,
      city: cityName,
      cityRef: matched?.cityRef,
      branch: '',
    })
  }

  return (
    <div
      className={`rounded-2xl border border-[#d7e8eb] bg-white ${
        compact ? 'p-4' : 'p-5'
      } space-y-4`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#536268]">
          <Truck className="text-[#183b46]" /> Служба та адреса доставки
        </span>
        <span className="text-[11px] text-[#78aeba]">Усі відділення України</span>
      </div>

      {/* Вибір служби доставки: Нова Пошта або Укрпошта */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => switchCarrier('nova_poshta')}
          className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium transition ${
            value.carrier === 'nova_poshta'
              ? 'border-[#183b46] bg-[#183b46] text-white shadow-xs'
              : 'border-[#dce2e2] bg-[#fbfcfb] text-[#536268] hover:bg-[#eff8fa]'
          }`}
        >
          <span className="inline-block size-2 rounded-full bg-[#ef4444]" />
          Нова Пошта
        </button>

        <button
          type="button"
          onClick={() => switchCarrier('ukrposhta')}
          className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium transition ${
            value.carrier === 'ukrposhta'
              ? 'border-[#183b46] bg-[#183b46] text-white shadow-xs'
              : 'border-[#dce2e2] bg-[#fbfcfb] text-[#536268] hover:bg-[#eff8fa]'
          }`}
        >
          <span className="inline-block size-2 rounded-full bg-[#facc15]" />
          Укрпошта
        </button>
      </div>

      {/* Пошук та вибір міста */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-[#536268]">
          1. Місто / Населений пункт
        </label>
        <div className="flex items-center gap-2 rounded-xl border border-[#dce2e2] bg-[#fbfcfb] px-3 py-2">
          <Search className="text-[#98a3a6]" />
          <input
            type="text"
            value={cityQuery}
            onChange={(e) => setCityQuery(e.target.value)}
            placeholder="Пошук міста (напр. Київ, Львів, Одеса, Буча...)"
            className="w-full bg-transparent text-xs outline-none placeholder:text-[#98a3a6]"
          />
        </div>

        <select
          aria-label="Оберіть місто"
          value={value.city}
          onChange={(e) => handleCitySelect(e.target.value)}
          className="w-full rounded-xl border border-[#dce2e2] bg-white px-3 py-2.5 text-xs font-medium text-[#1f3034] outline-none focus:border-[#78aeba]"
        >
          <option value="">— Оберіть населений пункт ({cities.length}) —</option>
          {cities.map((c) => (
            <option key={c.cityRef + c.name} value={c.name}>
              {c.name} ({c.region})
            </option>
          ))}
        </select>
      </div>

      {/* Пошук та вибір відділення Нової пошти або Укрпошти */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-[#536268]">
          2. Відділення або поштомат ({value.carrier === 'nova_poshta' ? 'Нова Пошта' : 'Укрпошта'})
        </label>
        <div className="flex items-center gap-2 rounded-xl border border-[#dce2e2] bg-[#fbfcfb] px-3 py-2">
          <MapPin className="text-[#98a3a6]" />
          <input
            type="text"
            value={branchQuery}
            onChange={(e) => setBranchQuery(e.target.value)}
            disabled={!value.city}
            placeholder={
              value.city
                ? 'Фільтр за номером відділення, індексом або вулицею...'
                : 'Спочатку оберіть місто вище'
            }
            className="w-full bg-transparent text-xs outline-none placeholder:text-[#98a3a6] disabled: opacity-50"
          />
        </div>

        <select
          aria-label="Оберіть відділення"
          value={value.branch}
          disabled={!value.city || loadingBranches}
          onChange={(e) =>
            onChange({
              ...value,
              branch: e.target.value,
            })
          }
          className="w-full rounded-xl border border-[#dce2e2] bg-white px-3 py-2.5 text-xs font-medium text-[#1f3034] outline-none focus:border-[#78aeba] disabled:bg-[#f4f7f7] disabled:text-[#98a3a6]"
        >
          {!value.city ? (
            <option value="">— Спочатку оберіть місто —</option>
          ) : loadingBranches ? (
            <option value="">Завантаження відділень...</option>
          ) : branches.length === 0 ? (
            <option value="">Відділень за запитом не знайдено</option>
          ) : (
            <>
              <option value="">— Оберіть відділення зі списку ({branches.length}) —</option>
              {branches.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </>
          )}
        </select>
      </div>
    </div>
  )
}
