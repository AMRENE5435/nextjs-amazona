// getAllPages.js
import { connectToDatabase } from './db/index'; // Ensure correct path
import Page from './db/models/web-page.model'; // Ensure correct model path

export async function getAllPages() {
  await connectToDatabase(process.env.MONGODB_URI); // Connect to the database
  const pages = await Page.find({}).select('slug title'); // Fetch pages with slug and title
  return pages.map((page) => ({
    path: `/page/${page.slug}`, // Prefix slug with /page/
    title: page.title, // Include title dynamically
  }));
}