const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Define the directory to search (e.g., all files in the `pages` and `components` folders)
const directory = './{app,components}/**/*.{js,jsx,ts,tsx}';

// Regex to match the <Image> component
const imageRegex = /<Img\s+([^>]+)\/>/g;

// Function to replace <Image> with <CustomImage>
const replaceImageWithCustomImage = (filePath) => {
  // Read the file content
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace all occurrences of <Image> with <CustomImage>
  const newContent = content.replace(imageRegex, (match, attributes) => {
    return `<CustomImage ${attributes} />`;
  });

  // Write the updated content back to the file
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log(`Updated: ${filePath}`);
};

// Find all files in the directory
glob(directory)
  .then((files) => {
    // Process each file
    files.forEach((file) => {
      replaceImageWithCustomImage(file);
    });

    console.log('All <Image> components have been replaced with <CustomImage>.');
  })
  .catch((err) => {
    console.error('Error finding files:', err);
  });