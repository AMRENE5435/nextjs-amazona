export async function getAllPages() {
    const pages = [
      { path: '/', title: 'Homepage - Laptop Solution' }, // Homepage
      { path: '/about', title: 'About Us - Laptop Solution' }, // About page
      { path: '/services', title: 'Our Services - Laptop Solution' }, // Services page
      { path: '/contact', title: 'Contact Us - Laptop Solution' }, // Contact page
      { path: '/blog', title: 'Blog - Laptop Solution' }, // Blog page
      { path: '/faq', title: 'FAQ - Laptop Solution' }, // FAQ page
      { path: '/privacy-policy', title: 'Privacy Policy - Laptop Solution' }, // Privacy Policy
      { path: '/terms-of-service', title: 'Terms of Service - Laptop Solution' }, // Terms of Service
      // Ila 3ndk chi pages dynamiques, zidhom hna
    ];
    return pages;
  }
