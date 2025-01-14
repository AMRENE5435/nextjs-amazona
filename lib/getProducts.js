// getProducts.js
import { connectToDatabase } from './db/index'; // Ensure correct path
import Product from './db/models/product.model'; // Ensure correct model path

export async function getProducts() {
  await connectToDatabase(process.env.MONGODB_URI); // Connect to the database
  const products = await Product.find({}).select('slug name price images sizes avgRating updatedAt'); // Fetch products with required fields
  return products.map((product) => ({
    slug: product.slug,
    name: product.name, // Product name
    price: product.price, // Product price
    image: product.images[0], // Use the first image
    osVersion: product.sizes.join(', '), // Join sizes for OS versions
    rating: product.avgRating, // Average rating
    lastModified: product.updatedAt || new Date(), // Use updatedAt or current date
  }));
}
