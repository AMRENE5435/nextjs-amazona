'use server';

import { connectToDatabase } from '@/lib/db';
import Product, { IProduct } from '@/lib/db/models/product.model';
import { revalidatePath } from 'next/cache';
import { formatError } from '../utils';
import { ProductInputSchema, ProductUpdateSchema } from '../validator';
import { IProductInput } from '@/types';
import { z } from 'zod';
import { getSetting } from './setting.actions';

// CREATE
export async function createProduct(data: IProductInput) {
  try {
    const product = ProductInputSchema.parse(data);
    await connectToDatabase();
    await Product.create(product);
    revalidatePath('/admin/products');
    return {
      success: true,
      message: 'Product created successfully',
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// UPDATE
export async function updateProduct(data: z.infer<typeof ProductUpdateSchema>) {
  try {
    const product = ProductUpdateSchema.parse(data);
    await connectToDatabase();
    await Product.findByIdAndUpdate(product._id, product, { new: true });
    revalidatePath('/admin/products');
    return {
      success: true,
      message: 'Product updated successfully',
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// DELETE
export async function deleteProduct(id: string) {
  try {
    await connectToDatabase();
    const res = await Product.findByIdAndDelete(id);
    if (!res) throw new Error('Product not found');
    revalidatePath('/admin/products');
    return {
      success: true,
      message: 'Product deleted successfully',
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// GET ONE PRODUCT BY ID
export async function getProductById(productId: string) {
  await connectToDatabase();
  const product = await Product.findById(productId);
  if (!product) throw new Error('Product not found');
  return JSON.parse(JSON.stringify(product)) as IProduct;
}

// GET ALL PRODUCTS FOR ADMIN
export async function getAllProductsForAdmin({
  query,
  page = 1,
  sort = 'latest',
  limit,
}: {
  query: string;
  page?: number;
  sort?: string;
  limit?: number;
}) {
  await connectToDatabase();

  const {
    common: { pageSize },
  } = await getSetting();
  limit = limit || pageSize;

  const queryFilter = query
    ? { name: { $regex: query, $options: 'i' } }
    : {};

  const order = getSortOrder(sort);

  const products = await Product.find(queryFilter)
    .sort(order)
    .skip(limit * (page - 1))
    .limit(limit)
    .lean();

  const countProducts = await Product.countDocuments(queryFilter);

  return {
    products: JSON.parse(JSON.stringify(products)) as IProduct[],
    totalPages: Math.ceil(countProducts / limit),
    totalProducts: countProducts,
    from: limit * (page - 1) + 1,
    to: limit * (page - 1) + products.length,
  };
}

// HELPER: Get Sort Order
function getSortOrder(sort: string) {
  return sort === 'best-selling'
    ? { numSales: -1 }
    : sort === 'price-low-to-high'
    ? { price: 1 }
    : sort === 'price-high-to-low'
    ? { price: -1 }
    : sort === 'avg-customer-review'
    ? { avgRating: -1 }
    : { createdAt: -1 };
}

// GET ALL CATEGORIES
export async function getAllCategories() {
  await connectToDatabase();
  return Product.find({ isPublished: true }).distinct('category');
}

// GET PRODUCTS FOR CARD
export async function getProductsForCard({
  tag,
  limit = 4,
}: {
  tag: string;
  limit?: number;
}) {
  await connectToDatabase();
  const products = await Product.find(
    { tags: { $in: [tag] }, isPublished: true },
    { name: 1, href: { $concat: ['/product/', '$slug'] }, image: { $arrayElemAt: ['$images', 0] } }
  )
    .sort({ createdAt: 'desc' })
    .limit(limit);

  return JSON.parse(JSON.stringify(products)) as {
    name: string;
    href: string;
    image: string;
  }[];
}

// GET PRODUCTS BY TAG
export async function getProductsByTag({
  tag,
  limit = 10,
}: {
  tag: string;
  limit?: number;
}) {
  await connectToDatabase();
  const products = await Product.find({ tags: { $in: [tag] }, isPublished: true })
    .sort({ createdAt: 'desc' })
    .limit(limit);
  return JSON.parse(JSON.stringify(products)) as IProduct[];
}

// GET ONE PRODUCT BY SLUG
export async function getProductBySlug(slug: string) {
  await connectToDatabase();
  const product = await Product.findOne({ slug, isPublished: true });
  if (!product) throw new Error('Product not found');
  return JSON.parse(JSON.stringify(product)) as IProduct;
}

// GET RELATED PRODUCTS
export async function getRelatedProductsByCategory({
  category,
  productId,
  limit = 4,
  page = 1,
}: {
  category: string;
  productId: string;
  limit?: number;
  page: number;
}) {
  await connectToDatabase();
  const skipAmount = (page - 1) * limit;
  const conditions = { isPublished: true, category, _id: { $ne: productId } };

  const products = await Product.find(conditions)
    .sort({ numSales: 'desc' })
    .skip(skipAmount)
    .limit(limit);

  const productsCount = await Product.countDocuments(conditions);

  return {
    data: JSON.parse(JSON.stringify(products)) as IProduct[],
    totalPages: Math.ceil(productsCount / limit),
  };
}

// GET ALL PRODUCTS
export async function getAllProducts({
  query,
  limit,
  page,
  category,
  tag,
  price,
  rating,
  sort,
}: {
  query: string;
  category: string;
  tag: string;
  limit?: number;
  page: number;
  price?: string;
  rating?: string;
  sort?: string;
}) {
  const {
    common: { pageSize },
  } = await getSetting();
  limit = limit || pageSize;

  await connectToDatabase();

  const queryFilter = query ? { name: { $regex: query, $options: 'i' } } : {};
  const categoryFilter = category ? { category } : {};
  const tagFilter = tag ? { tags: tag } : {};
  const priceFilter = price
    ? { price: { $gte: +price.split('-')[0], $lte: +price.split('-')[1] } }
    : {};
  const ratingFilter = rating ? { avgRating: { $gte: +rating } } : {};
  const order = getSortOrder(sort);

  const products = await Product.find({
    isPublished: true,
    ...queryFilter,
    ...categoryFilter,
    ...tagFilter,
    ...priceFilter,
    ...ratingFilter,
  })
    .sort(order)
    .skip(limit * (page - 1))
    .limit(limit)
    .lean();

  const countProducts = await Product.countDocuments({
    ...queryFilter,
    ...categoryFilter,
    ...tagFilter,
    ...priceFilter,
    ...ratingFilter,
  });

  return {
    products: JSON.parse(JSON.stringify(products)) as IProduct[],
    totalPages: Math.ceil(countProducts / limit),
    totalProducts: countProducts,
    from: limit * (page - 1) + 1,
    to: limit * (page - 1) + products.length,
  };
}

// GET ALL TAGS
export async function getAllTags() {
  const tags = await Product.aggregate([
    { $unwind: '$tags' },
    { $group: { _id: null, uniqueTags: { $addToSet: '$tags' } } },
    { $project: { _id: 0, uniqueTags: 1 } },
  ]);

  return (
    (tags[0]?.uniqueTags.sort().map((x: string) =>
      x
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    ) as string[]) || []
  );
}
