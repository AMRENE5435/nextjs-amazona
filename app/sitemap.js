import { getProducts } from '@/lib/getProducts'; // L path dyal getProducts
import { getAllPages } from '@/lib/getAllPages';

export default async function sitemap() {
  const baseUrl = 'https://www.laptopsolution.tech'; // URL dyal website dyalk
  const pages = await getAllPages(); // Jib l pages statiques
  const products = await getProducts(); // Jib l products dynamiques

  const pageUrls = pages.map((page) => ({
    url: `${baseUrl}${page}`,
    lastModified: new Date(),
    title: `Page Title for ${page}`, // Zid title dynamique
  }));

  const productUrls = products.map((product) => ({
    url: `${baseUrl}/product/${product.slug}`,
    lastModified: product.lastModified || new Date(),
    title: `Product: ${product.name}`, // Zid title dynamique
  }));

  return [
    ...pageUrls, // Zid l pages statiques
    ...productUrls, // Zid l products dynamiques
  ];
}