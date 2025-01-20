    import csv
    from bs4 import BeautifulSoup

    # Function to convert HTML to plain text
    def html_to_plain_text(html_content):
        if not html_content:
            return ""  # Return empty string if no content
        
        # Parse HTML using BeautifulSoup
        soup = BeautifulSoup(html_content, 'lxml')
        
        # Convert HTML to plain text with preserved line breaks
        text = soup.get_text(separator="\n")  # Use newline as separator between elements
        
        return text.strip()  # Remove leading/trailing whitespace

    # Read CSV file
    csv_file = r'I:\nextwebsite\Next Js project\nextjs-amazona\public\product copy.csv'  
    # Replace with your CSV file path
    ts_file = r'I:\nextwebsite\Next Js project\nextjs-amazona\lib\data copy.ts'

    products = []

    with open(csv_file, mode='r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        
        for row in reader:
            if row['Type'] == 'variable':
                # Set default category if missing
                category = row['Categories'] if row['Categories'] else 'T-Shirts'
                
                # Set default brand if missing
                brand = row['Categories'] if row['Categories'] else 'laptop solution'
                
                # Set price to 35 if it is 0
                price = float(row['Sale price']) if row['Sale price'] and float(row['Sale price']) != 0 else 35
                list_price = float(row['Regular price']) if row['Regular price'] else 0
                
                # Convert HTML description to plain text
                description = html_to_plain_text(row['Short description'] or row['Description'])
                
                # Parent product
                product = {
                    'name': row['Name'],
                    'slug': to_slug(row['Name']),
                    'category': category,
                    'images': [row['Images']] if row['Images'] else [],
                    'tags': [tag for tag in row['Tags'].split(',')] if row['Tags'] else [],
                    'isPublished': True if row['Published'] == '1' else False,
                    'price': price,
                    'listPrice': list_price,
                    'brand': brand,
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
                    'countInStock': 50,  # Always set stock to 50
                    'description': description,  # Use plain text description
                    'sizes': [],  # Will be filled from variations
                    'colors': [],  # Will be filled from variations
                    'variations': [],
                    'reviews': []
                }
                products.append(product)
            elif row['Type'] == 'variation':
                # Variation
                # Set stock to 50 for variations as well
                stock = 50
                variation = {
                    'id': int(row['ID']),
                    'sku': row['SKU'],
                    'price': float(row['Sale price']) if row['Sale price'] else 0,
                    'attribute': row['Attribute 1 name'],
                    'value': row['Attribute 1 value(s)'],
                    'stock': stock
                }
                # Add variation to the parent product
                parent_product = next((p for p in products if p['slug'] == to_slug(row['Parent'])), None)
                if parent_product:
                    parent_product['variations'].append(variation)
                    # Update parent stock (though it's already set to 50)
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
            file.write(f'    description: `{product["description"]}`,\n')  # Use backticks for multi-line text
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