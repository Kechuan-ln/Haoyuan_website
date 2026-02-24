import { useState } from 'react'
import type { ImgHTMLAttributes } from 'react'

interface ImageWithFallbackProps extends ImgHTMLAttributes<HTMLImageElement> {
  src?: string
  alt: string
  fallback?: React.ReactNode
}

export function ImageWithFallback({ src, alt, fallback, ...props }: ImageWithFallbackProps) {
  const [error, setError] = useState(false)

  if (!src || error) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="bg-bg-gray flex items-center justify-center w-full h-full">
        <span className="text-text-muted text-lg font-medium">{alt[0]}</span>
      </div>
    )
  }

  return <img src={src} alt={alt} onError={() => setError(true)} {...props} />
}
