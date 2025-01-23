import Image from 'next/image'
import { useState } from 'react'

interface ProductImageProps {
  src: string
  alt: string
  className?: string
}

export default function ProductImage({
  src,
  alt,
  className,
}: ProductImageProps) {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className={`relative ${className}`}>
      <img
        src={src}
        alt={alt}
        fill
        className={`object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoadingComplete={() => setIsLoading(false)}
        loading='lazy'
      />
      {isLoading && (
        <div className='absolute inset-0 bg-gray-200 animate-pulse' />
      )}
    </div>
  )
}
