import { getProducts } from '@/lib/getProducts' // L path dyal getProducts
import { getAllPages } from '@/lib/getAllPages'

export default async function sitemap() {
  const baseUrl = 'https://www.laptopsolution.tech' // URL dyal website dyalk
  const pages = await getAllPages() // Jib l pages statiques
  const products = await getProducts() // Jib l products dynamiques

  const pageUrls = pages.map((page) => ({
    url: `${baseUrl}${page.path}`,
    lastModified: new Date(),
    title: page.title, // Zid title dynamique
  }));

  const productUrls = products.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: product.lastModified,
    title: product.name, // Title dyal product
    price: product.price, // Price dyal product
    image: product.image, // Image dyal product
    osVersion: product.osVersion, // OS-version dyal product
    rating: product.rating, // Rating dyal product
    description: product.description, // Zid description
  }));

  return [
    ...pageUrls, // Zid l pages statiques
    ...productUrls, // Zid l products dynamiques
  ]
}
