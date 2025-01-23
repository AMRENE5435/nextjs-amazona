const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Define the directory to search (e.g., all files in the `pages` and `components` folders)
const directory = './{pages,components}/**/*.{js,jsx,ts,tsx}';

// Regex to match the <Image> component
const imageRegex = /<Image\s+([^>]+)\/>/g;

// Function to replace <Image> with <img>
const replaceImageWithImg = (filePath) => {
  // Read the file content
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace all occurrences of <Image> with <img>
  const newContent = content.replace(imageRegex, (match, attributes) => {
    // Extract the src, alt, width, and height attributes
    const srcMatch = attributes.match(/src=["']([^"']+)["']/);
    const altMatch = attributes.match(/alt=["']([^"']+)["']/);
    const widthMatch = attributes.match(/width=["']([^"']+)["']/);
    const heightMatch = attributes.match(/height=["']([^"']+)["']/);

    const src = srcMatch ? srcMatch[1] : '';
    const alt = altMatch ? altMatch[1] : '';
    const width = widthMatch ? widthMatch[1] : '';
    const height = heightMatch ? heightMatch[1] : '';

    // Construct the <img> tag
    return `<img src="${src}" alt="${alt}" width="${width}" height="${height}" />`;
  });

  // Write the updated content back to the file
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log(`Updated: ${filePath}`);
};

// Find all files in the directory
glob(directory, (err, files) => {
  if (err) {
    console.error('Error finding files:', err);
    return;
  }

  // Process each file
  files.forEach((file) => {
    replaceImageWithImg(file);
  });

  console.log('All <Image> components have been replaced with <img>.');
});