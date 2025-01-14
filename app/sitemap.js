// sitemap.js
import { getProducts } from '@/lib/getProducts';
import { getAllPages } from '@/lib/getAllPages';

export default async function sitemap() {
  const baseUrl = 'https://www.laptopsolution.tech'; // Website base URL
  const pages = await getAllPages(); // Fetch static pages
  const products = await getProducts(); // Fetch dynamic products

  // Map static pages with dynamic titles
  const pageUrls = pages.map((page) => ({
    url: `${baseUrl}${page.path}`,
    lastModified: new Date(),
    title: page.title, // Include page title dynamically
  }));

  // Map dynamic products with all required details
  const productUrls = products.map((product) => ({
    url: `${baseUrl}/product/${product.slug}`,
    lastModified: product.lastModified,
    title: product.name, // Product title
    price: product.price, // Product price
    image: product.image, // Product image
    osVersion: product.osVersion, // Product OS version
    rating: product.rating, // Product rating
  }));

  // Combine and return both static pages and dynamic products
  return [...pageUrls, ...productUrls];
}