import BrowsingHistoryList from '@/components/shared/browsing-history-list'
import { HomeCard } from '@/components/shared/home/home-card'
import { HomeCarousel } from '@/components/shared/home/home-carousel'
import ProductSlider from '@/components/shared/product/product-slider'
import { Card, CardContent } from '@/components/ui/card'
import {
  getProductsForCard,
  getProductsByTag,
  getAllCategories,
} from '@/lib/actions/product.actions'
import { getSetting } from '@/lib/actions/setting.actions'
import { toSlug } from '@/lib/utils'
import { getTranslations } from 'next-intl/server'
import Head from 'next/head' // Import Head for adding schema markup

export default async function HomePage() {
  const t = await getTranslations('Home')
  const { carousels } = await getSetting()
  const todaysDeals = await getProductsByTag({ tag: 'todays-deal' })
  const bestSellingProducts = await getProductsByTag({ tag: 'best-seller' })

  const categories = (await getAllCategories()).slice(0, 4)
  const newArrivals = await getProductsForCard({
    tag: 'new-arrival',
  })
  const featureds = await getProductsForCard({
    tag: 'featured',
  })
  const bestSellers = await getProductsForCard({
    tag: 'best-seller',
  })
  const cards = [
    {
      title: t('Categories to explore'),
      link: {
        text: t('See More'),
        href: '/search',
      },
      items: categories.map((category) => ({
        name: category,
        image: `/icons/${toSlug(category)}.png`,
        href: `/search?category=${category}`,
      })),
    },
    {
      title: t('Explore New Arrivals'),
      items: newArrivals,
      link: {
        text: t('See More'),
        href: '/search?tag=Adobe',
      },
    },
    {
      title: t('Discover Best Sellers'),
      items: bestSellers,
      link: {
        text: t('See More'),
        href: '/search?tag=new-arrival',
      },
    },
    {
      title: t('Featured Products'),
      items: featureds,
      link: {
        text: t('See More'),
        href: '/search?tag=new-arrival',
      },
    },
  ]

  return (
    <>
      {/* Add Schema Markup for the Home Page */}
      <Head>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Website",
            "name": "Laptop Solution", // Replace with your website name
            "url": "https://www.laptopsolution.tech", // Replace with your website URL
            "description": "Your one-stop solution for laptops and software.", // Replace with your website description
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://www.laptopsolution.tech/search?q={search_term_string}", // Replace with your search URL
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
      </Head>

      {/* Home Page Content */}
      <HomeCarousel items={carousels} />
      <div className='md:p-4 md:space-y-4 bg-border rounded-md'>
        <HomeCard cards={cards} />
        <Card className='w-full rounded-none'>
          <CardContent className='p-4 items-center gap-3 rounded-lg'>
            <ProductSlider title={t("Today's Deals")} products={todaysDeals} />
          </CardContent>
        </Card>
        <Card className='w-full rounded-none'>
          <CardContent className='p-4 items-center gap-3'>
            <ProductSlider
              title={t('Best Selling Products')}
              products={bestSellingProducts}
              hideDetails
            />
          </CardContent>
        </Card>
      </div>

      <div className='p-4 bg-background'>
        <BrowsingHistoryList />
      </div>
    </>
  )
}