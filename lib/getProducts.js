import { connectToDatabase } from './db/index' // T2kd bach l path s7i7
import Product from './db/models/product.model' // T2kd bach l path s7i7

export async function getProducts() {
  await connectToDatabase(process.env.MONGODB_URI) // Connecti l database
  const products = await Product.find({}).select('slug name price images sizes avgRating description updatedAt') // Jib l products b slug o updatedAt
  return products.map((product) => ({
    slug: product.slug,
    name: product.name,
    price: product.price,
    image: product.images[0], // Khod l image loul
    osVersion: product.sizes.join(', '),
    rating: product.avgRating,
    description: product.description,
    lastModified: product.updatedAt || new Date(),
  }))
}
