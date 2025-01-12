/* eslint-disable @typescript-eslint/no-explicit-any */
import data from '@/lib/Hold data'
import { connectToDatabase } from '.'
import User from './models/user.model'
import Product from './models/product.model'
import Review from './models/review.model'
import { cwd } from 'process'
import { loadEnvConfig } from '@next/env'
import Order from './models/order.model'
import {
  calculateFutureDate,
  calculatePastDate,
  generateId,
  round2,
} from '../utils'
import WebPage from './models/web-page.model'
import Setting from './models/setting.model'
import { OrderItem, IOrderInput, ShippingAddress } from '@/types'

loadEnvConfig(cwd())

// Function to split an array into batches
const splitIntoBatches = <T>(array: T[], batchSize: number): T[][] => {
  const batches: T[][] = []
  for (let i = 0; i < array.length; i += batchSize) {
    batches.push(array.slice(i, i + batchSize))
  }
  return batches
}

// Function to insert data in batches with a pause
const insertInBatches = async <T>(
  model: any, // Replace with the appropriate model type if available
  batches: T[][],
  collectionName: string
) => {
  for (let i = 0; i < batches.length; i++) {
    await model.insertMany(batches[i])
    console.log(`Batch ${i + 1} of ${collectionName} inserted successfully.`)
    await new Promise((resolve) => setTimeout(resolve, 1000)) // 1-second pause
  }
}

// Function to generate an order
const generateOrder = async (
  i: number,
  users: string[], // Array of user IDs
  products: string[] // Array of product IDs
): Promise<IOrderInput> => {
  const product1 = await Product.findById(products[i % products.length])
  const product2 = await Product.findById(
    products[
      i % products.length >= products.length - 1
        ? (i % products.length) - 1
        : (i % products.length) + 1
    ]
  )
  const product3 = await Product.findById(
    products[
      i % products.length >= products.length - 2
        ? (i % products.length) - 2
        : (i % products.length) + 2
    ]
  )

  if (!product1 || !product2 || !product3) throw new Error('Product not found')

  const items: OrderItem[] = [
    {
      clientId: generateId(),
      product: product1._id,
      name: product1.name,
      slug: product1.slug,
      quantity: 1,
      image: product1.images[0],
      category: product1.category,
      price: product1.price,
      countInStock: product1.countInStock,
    },
    {
      clientId: generateId(),
      product: product2._id,
      name: product2.name,
      slug: product2.slug,
      quantity: 2,
      image: product2.images[0],
      category: product1.category,
      price: product2.price,
      countInStock: product1.countInStock,
    },
    {
      clientId: generateId(),
      product: product3._id,
      name: product3.name,
      slug: product3.slug,
      quantity: 3,
      image: product3.images[0],
      category: product1.category,
      price: product3.price,
      countInStock: product1.countInStock,
    },
  ]

  const order: IOrderInput = {
    user: users[i % users.length],
    items: items.map((item) => ({
      ...item,
      product: item.product,
    })),
    shippingAddress: data.users[i % users.length].address,
    paymentMethod: data.users[i % users.length].paymentMethod,
    isPaid: true,
    isDelivered: true,
    paidAt: calculatePastDate(i),
    deliveredAt: calculatePastDate(i),
    // createdAt: calculatePastDate(i),
    expectedDeliveryDate: calculateFutureDate(i % 2),
    ...calcDeliveryDateAndPriceForSeed({
      items: items,
      shippingAddress: data.users[i % users.length].address,
      deliveryDateIndex: i % 2,
    }),
  }
  return order
}

// Function to calculate delivery date and price
export const calcDeliveryDateAndPriceForSeed = ({
  items,
  deliveryDateIndex,
}: {
  deliveryDateIndex?: number
  items: OrderItem[]
  shippingAddress?: ShippingAddress
}) => {
  const { availableDeliveryDates } = data.settings[0]
  const itemsPrice = round2(
    items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  )

  const deliveryDate =
    availableDeliveryDates[
      deliveryDateIndex === undefined
        ? availableDeliveryDates.length - 1
        : deliveryDateIndex
    ]

  const shippingPrice = deliveryDate.shippingPrice

  const taxPrice = round2(itemsPrice * 0.15)
  const totalPrice = round2(
    itemsPrice +
      (shippingPrice ? round2(shippingPrice) : 0) +
      (taxPrice ? round2(taxPrice) : 0)
  )
  return {
    availableDeliveryDates,
    deliveryDateIndex:
      deliveryDateIndex === undefined
        ? availableDeliveryDates.length - 1
        : deliveryDateIndex,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
  }
}

// Main function to seed the database
const main = async () => {
  try {
    const { users, products, reviews, webPages, settings } = data
    await connectToDatabase(process.env.MONGODB_URI)

    // Delete old data
    await User.deleteMany()
    await Product.deleteMany()
    await Review.deleteMany()
    await Order.deleteMany()
    await Setting.deleteMany()
    await WebPage.deleteMany()

    // Split users and products into batches
    const userBatches = splitIntoBatches(users, 100) // 100 users per batch
    const productBatches = splitIntoBatches(products, 100) // 100 products per batch

    // Insert users in batches
    await insertInBatches(User, userBatches, 'users')

    // Insert products in batches
    await insertInBatches(Product, productBatches, 'products')

    // Insert other data (reviews, orders, settings, webPages)
    const createdUser = await User.find() // Fetch inserted users
    const createdProducts = await Product.find() // Fetch inserted products

    // Insert reviews
    const rws = []
    for (let i = 0; i < createdProducts.length; i++) {
      let x = 0
      const { ratingDistribution } = createdProducts[i]
      for (let j = 0; j < ratingDistribution.length; j++) {
        for (let k = 0; k < ratingDistribution[j].count; k++) {
          x++
          rws.push({
            ...reviews.filter((x) => x.rating === j + 1)[
              x % reviews.filter((x) => x.rating === j + 1).length
            ],
            isVerifiedPurchase: true,
            product: createdProducts[i]._id,
            user: createdUser[x % createdUser.length]._id,
            updatedAt: Date.now(),
            createdAt: Date.now(),
          })
        }
      }
    }
    await Review.insertMany(rws)

    // Insert orders
    const orders: IOrderInput[] = []
    for (let i = 0; i < 200; i++) {
      orders.push(
        await generateOrder(
          i,
          createdUser.map((x) => x._id),
          createdProducts.map((x) => x._id)
        )
      )
    }
    await Order.insertMany(orders)

    // Insert settings
    await Setting.insertMany(settings)

    // Insert webPages
    await WebPage.insertMany(webPages)

    console.log({
      createdUser,
      createdProducts,
      createdReviews: rws,
      createdOrders: orders,
      createdSettings: settings,
      createdWebPages: webPages,
      message: 'Seeded database successfully',
    })
    process.exit(0)
  } catch (error) {
    console.error(error)
    throw new Error('Failed to seed database')
  }
}

main()
