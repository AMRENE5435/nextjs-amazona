import { NextResponse } from 'next/server'
import { parse } from 'csv-parse/sync'
// import fs from 'fs'
import { toSlug } from '@/lib/utils' // Supposons que toSlug kayn f utils.ts

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('csvFile') as File

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
  }

  const fileBuffer = await file.arrayBuffer()
  const fileContent = Buffer.from(fileBuffer).toString('utf-8')

  const products = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  }).map((row: any) => ({
    name: row.name,
    slug: toSlug(row.name),
    category: row.category,
    images: row.images.split(','),
    tags: row.tags.split(','),
    isPublished: row.isPublished === 'true',
    price: parseFloat(row.price),
    listPrice: parseFloat(row.listPrice),
    brand: row.brand,
    avgRating: parseFloat(row.avgRating),
    numReviews: parseInt(row.numReviews),
    ratingDistribution: JSON.parse(row.ratingDistribution),
    numSales: parseInt(row.numSales),
    countInStock: parseInt(row.countInStock),
    description: row.description,
    sizes: row.sizes.split(','),
    colors: row.colors.split(','),
    reviews: [],
  }))

  // Ici, ghadi nzido les produits f database (exemple: MongoDB)
  // await db.insertMany(products);

  return NextResponse.json({
    message: 'Products uploaded successfully!',
    products,
  })
}
