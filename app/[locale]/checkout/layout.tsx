import { HelpCircle } from 'lucide-react'
import CustomImage from '@/components/CustomImage'
import Link from 'next/link'
import React from 'react'
import { getSetting } from '@/lib/actions/setting.actions'

export default async function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { site } = await getSetting()

  return (
    <div className='p-4'>
      <header className='bg-black mb-4 border-b sticky top-0 z-10'>
        <div className='max-w-6xl mx-auto flex justify-between items-center'>
          <Link href='/'>
            <CustomImage
              src={site.logo}
              alt='logo'
              width={150}
              height={70}
              style={{
                maxWidth: '100%',
                height: 'auto',
              }}
            />
          </Link>
          <div>
            <h1 className='text-3xl font-bold text-center text-white'>
              Checkout
            </h1>
          </div>
          <div>
            <Link href='/page/help'>
              <HelpCircle className='w-6 h-6 text-white' />
            </Link>
          </div>
        </div>
      </header>
      {children}
    </div>
  )
}
