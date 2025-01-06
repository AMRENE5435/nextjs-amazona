import { NextApiRequest, NextApiResponse } from 'next';
import { parse } from 'csv-parse';
import { createProduct } from '@/lib/actions/product.actions'; // Create product action

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const file = req.body;
    const products: any[] = [];

    // Parse CSV
    parse(file, { columns: true, trim: true }, async (err, records) => {
      if (err) {
        return res.status(400).json({ message: 'Invalid CSV file' });
      }
      for (const record of records) {
        // Map CSV columns to product fields
        const newProduct = {
          name: record['name'],
          price: record['price'],
          category: record['category'],
          countInStock: record['countInStock'],
          description: record['description'],
        };
        await createProduct(newProduct); // Save each product
      }
      res.status(200).json({ message: 'Products uploaded successfully' });
    });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
