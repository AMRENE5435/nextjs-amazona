'use client'
import { ChevronUp } from 'lucide-react'
import Link from 'next/link'
import CustomImage from '@/components/CustomImage'

import { Button } from '@/components/ui/button'
import useSettingStore from '@/hooks/use-setting-store'
import { Select, SelectContent, SelectItem, SelectTrigger } from '../ui/select'

import { SelectValue } from '@radix-ui/react-select'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/routing'
import { i18n } from '@/i18n-config'

export default function Footer() {
  const router = useRouter()
  const pathname = usePathname()
  const {
    setting: { site, availableCurrencies, currency },
    setCurrency,
  } = useSettingStore()
  const { locales } = i18n

  const locale = useLocale()
  const t = useTranslations()
  return (
    <footer className='bg-black text-white underline-link'>
      <div className='w-full'>
        <Button
          variant='ghost'
          className='bg-gray-800 w-full rounded-none'
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <ChevronUp className='mr-2 h-4 w-4' />
          {t('Footer.Back to top')}
        </Button>
        <div className='text-center grid grid-cols-1 md:grid-cols-3 gap-6 p-6 max-w-7xl mx-auto'>
          {/* Get to Know Us Section */}
          <div className='w-full'>
            <h3 className='font-bold mb-2 border border-gray-400 p-2 rounded-lg w-full'>
              {t('Footer.Get to Know Us')}
            </h3>
            <ul className='space-y-2'>
              <li>
                <Link href='/page/careers'>{t('Footer.Careers')}</Link>
              </li>
              <li>
                <Link href='/page/blog'>{t('Footer.Blog')}</Link>
              </li>
              <li>
                <Link href='/page/about-us'>
                  {t('Footer.About name', { name: site.name })}
                </Link>
              </li>
            </ul>
          </div>

          {/* Make Money with Us Section */}
          <div className='w-full'>
            <h3 className='font-bold mb-2 border border-gray-400 p-2 rounded-lg w-full'>
              {t('Footer.Make Money with Us')}
            </h3>
            <ul className='space-y-2'>
              <li>
                <Link href='/page/sell'>
                  {t('Footer.Sell products on', { name: site.name })}
                </Link>
              </li>
              <li>
                <Link href='/page/become-affiliate'>
                  {t('Footer.Become an Affiliate')}
                </Link>
              </li>
              <li>
                <Link href='/page/advertise'>
                  {t('Footer.Advertise Your Products')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Let Us Help You Section */}
          <div className='w-full'>
            <h3 className='font-bold mb-2 border border-gray-400 p-2 rounded-lg w-full'>
              {t('Footer.Let Us Help You')}
            </h3>
            <ul className='space-y-2'>
              <li>
                <Link href='/page/shipping'>
                  {t('Footer.Shipping Rates & Policies')}
                </Link>
              </li>
              <li>
                <Link href='/page/returns-policy'>
                  {t('Footer.Returns & Replacements')}
                </Link>
              </li>
              <li>
                <Link href='/page/help'>{t('Footer.Help')}</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className='border-t border-gray-800'>
          <div className='max-w-7xl mx-auto py-8 px-4 flex flex-col items-center space-y-4'>
            <div className='flex flex-col md:flex-row items-center justify-center w-full gap-4'>
              {/* Logo with Divider Below (Mobile Only) */}
              <div className='w-full md:w-auto flex flex-col items-center'>
                <CustomImage
                  src={site.logo}
                  width={194}
                  height={70}
                  alt={`${site.name} logo`}
                  className='mx-auto w-14 md:w-22' // Center the logo on mobile and adjust size for desktop
                />
                {/* Divider Below Logo (Mobile Only) */}
                <div className='flex justify-center w-full md:hidden'>
                  <div className='w-80 h-px bg-gray-400 my-2'></div>{' '}
                  {/* Centered divider */}
                </div>
              </div>

              {/* Language and Currency Dropdowns */}
              <div className='flex items-center justify-center gap-4'>
                <Select
                  value={locale}
                  onValueChange={(value) => {
                    router.push(pathname, { locale: value })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('Footer.Select a language')} />
                  </SelectTrigger>
                  <SelectContent>
                    {locales.map((lang, index) => (
                      <SelectItem key={index} value={lang.code}>
                        <Link
                          className='w-full flex items-center gap-1'
                          href={pathname}
                          locale={lang.code}
                        >
                          <span className='text-lg'>{lang.icon}</span>{' '}
                          {lang.name}
                        </Link>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={currency}
                  onValueChange={(value) => {
                    setCurrency(value)
                    window.scrollTo(0, 0)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('Footer.Select a currency')} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCurrencies
                      .filter((x) => x.code)
                      .map((currency, index) => (
                        <SelectItem key={index} value={currency.code}>
                          {currency.name} ({currency.code})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='p-4'>
        <div className='flex justify-center gap-3 text-sm'>
          <Link href='/page/conditions-of-use'>
            {t('Footer.Conditions of Use')}
          </Link>
          <Link href='/page/privacy-policy'>{t('Footer.Privacy Notice')}</Link>
          <Link href='/page/help'>{t('Footer.Help')}</Link>
        </div>
        <div className='flex justify-center text-sm'>
          <p> © {site.copyright}</p>
        </div>
        <div className='mt-8 flex justify-center text-sm text-gray-400'>
          {site.address} | Whatsapp {site.phone}
        </div>
      </div>
    </footer>
  )
}