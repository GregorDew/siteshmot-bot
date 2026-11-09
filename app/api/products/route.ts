import { NextRequest, NextResponse } from 'next/server'
import {
  createProductInDb,
  deleteProductFromDb,
  getAllProducts,
  type ProductCategoryType,
  type ProductGender,
} from '@/lib/db-products'

export const runtime = 'edge'

export async function GET() {
  const products = await getAllProducts()
  return NextResponse.json({ products })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      name,
      price,
      description,
      material,
      categoryType,
      gender,
      sizes,
      image,
      color,
    } = body

    if (!name || price === undefined || !description || !material || !categoryType || !gender) {
      return NextResponse.json(
        { error: 'Заповніть усі обов’язкові поля товару (назва, ціна, опис, матеріал, вид, стать).' },
        { status: 400 }
      )
    }

    const parsedSizes = Array.isArray(sizes) && sizes.length > 0 ? sizes : ['One Size']

    const product = await createProductInDb({
      name: String(name),
      price: Number(price),
      description: String(description),
      material: String(material),
      categoryType: categoryType as ProductCategoryType,
      gender: gender as ProductGender,
      sizes: parsedSizes.map(String),
      image:
        image ||
        'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=85',
      color: color || 'bg-[#e8eef0]',
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (err) {
    return NextResponse.json(
      { error: `Не вдалося створити товар: ${(err as Error).message}` },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = Number(searchParams.get('id'))
  if (!id) {
    return NextResponse.json({ error: 'Не вказано ID товару' }, { status: 400 })
  }
  await deleteProductFromDb(id)
  return NextResponse.json({ deleted: true })
}
