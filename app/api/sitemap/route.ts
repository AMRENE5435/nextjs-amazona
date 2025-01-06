import { NextResponse } from 'next/server';
import { getAllProducts } from '@/lib/db';  // Supposons que getAllProducts kayn f db.ts

export async function GET() {
  const products = await getAllProducts();  // Récupérer tous les produits

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${products.map((product: any) => `
        <url>
          <loc>https://www.yourwebsite.com/product/${product.slug}</loc>
          <lastmod>${new Date().toISOString()}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>0.8</priority>
        </url>
      `).join('')}
    </urlset>
  `;

  return new NextResponse(sitemap, {
    headers: { 'Content-Type': 'application/xml' },
  });
}