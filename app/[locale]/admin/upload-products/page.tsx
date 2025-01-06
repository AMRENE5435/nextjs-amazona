'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner' // Import mn sonner

export default function UploadProductsPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      toast.error('Please select a file.')
      return
    }

    setIsLoading(true)

    const formData = new FormData()
    formData.append('csvFile', file)

    try {
      const response = await fetch('/api/upload-products', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        toast.success('Products uploaded successfully!')
        router.refresh()
      } else {
        toast.error('Failed to upload products.')
      }
    } catch (error) {
      toast.error('An error occurred while uploading the file.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='p-4'>
      <h1 className='text-2xl font-bold mb-4'>Upload Products via CSV</h1>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <Input type='file' accept='.csv' onChange={handleFileChange} />
        <Button type='submit' disabled={isLoading}>
          {isLoading ? 'Uploading...' : 'Upload'}
        </Button>
      </form>
    </div>
  )
}
