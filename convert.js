const fs = require('fs');
const csv = require('csv-parser');
const { toSlug } = require('./utils');  // Supposons que toSlug kayn f fichier utils.js

const products = [];

fs.createReadStream('products.csv')
  .pipe(csv())
  .on('data', (row) => {
    const product = {
      name: row.name,
      slug: toSlug(row.name),  // Utilisation dyal toSlug bach n3mlo slug
      category: row.category,
      images: row.images.split(','),  // Convertir string l array
      tags: row.tags.split(','),      // Convertir string l array
      isPublished: row.isPublished === 'true',  // Convertir string l boolean
      price: parseFloat(row.price),
      listPrice: parseFloat(row.listPrice),
      brand: row.brand,
      avgRating: parseFloat(row.avgRating),
      numReviews: parseInt(row.numReviews),
      ratingDistribution: JSON.parse(row.ratingDistribution),  // Convertir string l array d'objets
      numSales: parseInt(row.numSales),
      countInStock: parseInt(row.countInStock),
      description: row.description,
      sizes: row.sizes.split(','),    // Convertir string l array
      colors: row.colors.split(','),  // Convertir string l array
      reviews: [],  // Reviews vide par défaut
    };
    products.push(product);
  })
  .on('end', () => {
    fs.writeFileSync('products.json', JSON.stringify(products, null, 2));
    console.log('CSV successfully converted to JSON!');
  });