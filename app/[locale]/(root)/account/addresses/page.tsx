import { Metadata } from 'next'
import { SessionProvider } from 'next-auth/react'

import { auth } from '@/auth'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'

const PAGE_TITLE = 'Addresses'
export const metadata: Metadata = {
  title: PAGE_TITLE,
}
export default async function ProfilePage() {
  const session = await auth()
  return (
    <div className='mb-24'>
      <SessionProvider session={session}>
        <div className='flex gap-2 '>
          <Link href='/account'>Addresses</Link>
          <span>›</span>
          <span>{PAGE_TITLE}</span>
        </div>
        <h1 className='h1-bold py-4'>{PAGE_TITLE}</h1>
        <Card className='max-w-2xl '>
          <CardContent className='p-4 flex justify-between flex-wrap'>
            <div>
              <h3 className='font-bold'>Current addres</h3>
              <p>{session?.user.name}</p>
            </div>
            <div>
              <Link href='/account/addresses/Current-addres'>
                <Button className='rounded-full w-32' variant='outline'>
                  Edit
                </Button>
              </Link>
            </div>
          </CardContent>
          <Separator />
          <CardContent className='p-4 flex justify-between flex-wrap'>
            <div>
              <h3 className='font-bold'>New address</h3>
              <p>{session?.user.email}</p>
            </div>
            <div>
              <Link href='#'>
                <Button className='rounded-full w-32' variant='outline'>
                  Add address
                </Button>
              </Link>
            </div>
          </CardContent>
          <Separator />
        </Card>
      </SessionProvider>
    </div>
  )
}
