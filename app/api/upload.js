import multer from 'multer'
import csv from 'csv-parser'
import fs from 'fs'
import { toSlug } from '@/utils' // Supposons que toSlug kayn f utils.js
import Product from '@/models/Product' // Supposons que Product kayn f models/Product.js

const upload = multer({ dest: 'uploads/' })

export const config = {
  api: {
    bodyParser: false, // Désactiver bodyParser par défaut
  },
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    upload.single('csvFile')(req, res, async (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error uploading file.' })
      }

      const products = []

      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (row) => {
          const product = {
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
          }
          products.push(product)
        })
        .on('end', async () => {
          try {
            await Product.insertMany(products) // Ajouter les produits f database
            fs.unlinkSync(req.file.path) // Supprimer fichier CSV mn server
            res
              .status(200)
              .json({ message: 'Products uploaded successfully!', products })
          } catch (error) {
            res
              .status(500)
              .json({ message: 'Error saving products to database.' })
          }
        })
    })
  } else {
    res.status(405).json({ message: 'Method not allowed.' })
  }
}
