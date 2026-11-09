import { NextRequest, NextResponse } from 'next/server'
import { getBranchesForCity, searchCities } from '@/lib/shipping-directory'
import type { DeliveryCarrier } from '@/lib/db-customers'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'cities'
  const query = searchParams.get('q') || ''
  const carrier = (searchParams.get('carrier') || 'nova_poshta') as DeliveryCarrier
  const city = searchParams.get('city') || ''
  const cityRef = searchParams.get('cityRef') || undefined

  if (type === 'branches') {
    if (!city) {
      return NextResponse.json({ branches: [] })
    }
    const branches = await getBranchesForCity(carrier, city, cityRef, query)
    return NextResponse.json({ branches })
  }

  const cities = await searchCities(query)
  return NextResponse.json({ cities })
}
