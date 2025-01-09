
import csv

# Function to convert product name to slug
def to_slug(name):
    return name.lower().replace(" ", "-").replace(".", "").replace(",", "")

# Function to escape double quotes
def escape_double_quotes(text):
    return text.replace('"', '\\"')

# Read CSV file
csv_file = r'I:\nextwebsite\Next Js project\nextjs-amazona\public\product copy.csv'  
# Replace with your CSV file path
ts_file = r'I:\nextwebsite\Next Js project\nextjs-amazona\lib\data copy.ts'

products = []

with open(csv_file, mode='r', encoding='utf-8') as file:
    reader = csv.DictReader(file)
    
    for row in reader:
        if row['Type'] == 'variable':
            # Parent product
            product = {
                'name': escape_double_quotes(row['Name']),
                'slug': to_slug(row['Name']),
                'category': escape_double_quotes(row['Categories']),
                'images': [escape_double_quotes(row['Images'])] if row['Images'] else [],
                'tags': [escape_double_quotes(tag) for tag in row['Tags'].split(',')] if row['Tags'] else [],
                'isPublished': True if row['Published'] == '1' else False,
                'price': float(row['Sale price']) if row['Sale price'] else 0,
                'listPrice': float(row['Regular price']) if row['Regular price'] else 0,
                'brand': escape_double_quotes(row['Categories']),  # Assuming category as brand
                'avgRating': 0,
                'numReviews': 0,
                'ratingDistribution': [
                    { 'rating': 1, 'count': 0 },
                    { 'rating': 2, 'count': 0 },
                    { 'rating': 3, 'count': 0 },
                    { 'rating': 4, 'count': 0 },
                    { 'rating': 5, 'count': 0 }
                ],
                'numSales': 0,
                'countInStock': 0,  # Will be calculated from variations
                'description': escape_double_quotes(row['Short description'] or row['Description']),
                'sizes': [],  # Will be filled from variations
                'colors': [],  # Will be filled from variations
                'variations': [],
                'reviews': []
            }
            products.append(product)
        elif row['Type'] == 'variation':
            # Variation
            variation = {
                'id': int(row['ID']),
                'sku': escape_double_quotes(row['SKU']),
                'price': float(row['Sale price']) if row['Sale price'] else 0,
                'attribute': escape_double_quotes(row['Attribute 1 name']),
                'value': escape_double_quotes(row['Attribute 1 value(s)']),
                'stock': int(row['Stock']) if row['Stock'] else 0
            }
            # Add variation to the parent product
            parent_product = next((p for p in products if p['slug'] == to_slug(row['Parent'])), None)
            if parent_product:
                parent_product['variations'].append(variation)
                # Update parent stock
                parent_product['countInStock'] += variation['stock']
                # Update sizes and colors if applicable
                if variation['attribute'] == 'Size' and variation['value'] not in parent_product['sizes']:
                    parent_product['sizes'].append(variation['value'])
                if variation['attribute'] == 'Color' and variation['value'] not in parent_product['colors']:
                    parent_product['colors'].append(variation['value'])

# Generate data.ts file
with open(ts_file, mode='w', encoding='utf-8') as file:
    file.write("import { Data, IProductInput } from '@/types'\n")
    file.write("import { toSlug } from './utils'\n\n")
    file.write("const products: IProductInput[] = [\n")
    
    for product in products:
        file.write("  {\n")
        file.write(f'    name: "{product["name"]}",\n')
        file.write(f'    slug: toSlug("{product["name"]}"),\n')
        file.write(f'    category: "{product["category"]}",\n')
        file.write(f'    images: {product["images"]},\n')
        file.write(f'    tags: {product["tags"]},\n')
        file.write(f'    isPublished: {str(product["isPublished"]).lower()},\n')
        file.write(f'    price: {product["price"]},\n')
        file.write(f'    listPrice: {product["listPrice"]},\n')
        file.write(f'    brand: "{product["brand"]}",\n')
        file.write(f'    avgRating: {product["avgRating"]},\n')
        file.write(f'    numReviews: {product["numReviews"]},\n')
        file.write(f'    ratingDistribution: {product["ratingDistribution"]},\n')
        file.write(f'    numSales: {product["numSales"]},\n')
        file.write(f'    countInStock: {product["countInStock"]},\n')
        file.write(f'    description: "{product["description"]}",\n')
        file.write(f'    sizes: {product["sizes"]},\n')
        file.write(f'    colors: {product["colors"]},\n')
        file.write("    variations: [\n")
        for variation in product['variations']:
            file.write("      {\n")
            file.write(f'        id: {variation["id"]},\n')
            file.write(f'        sku: "{variation["sku"]}",\n')
            file.write(f'        price: {variation["price"]},\n')
            file.write(f'        attribute: "{variation["attribute"]}",\n')
            file.write(f'        value: "{variation["value"]}",\n')
            file.write(f'        stock: {variation["stock"]}\n')
            file.write("      },\n")
        file.write("    ],\n")
        file.write("    reviews: []\n")
        file.write("  },\n")
    
    file.write("]\n\n")
    file.write("export default products\n")

print(f"Generated {ts_file} successfully!")