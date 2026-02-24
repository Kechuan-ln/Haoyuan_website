import { useRef, useEffect, createElement } from 'react'
import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface AnimatedSectionProps {
  children: ReactNode
  className?: string
  variant?: 'up' | 'left' | 'scale'
  delay?: 0 | 100 | 200 | 300 | 400
  as?: 'div' | 'section' | 'article' | 'aside' | 'li' | 'span'
}

const variantClass = {
  up: 'scroll-animate',
  left: 'scroll-animate-left',
  scale: 'scroll-animate-scale',
}

const delayClass = {
  0: '',
  100: 'delay-100',
  200: 'delay-200',
  300: 'delay-300',
  400: 'delay-400',
}

export default function AnimatedSection({
  children,
  className,
  variant = 'up',
  delay = 0,
  as = 'div',
}: AnimatedSectionProps) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible')
          observer.unobserve(el)
        }
      },
      { threshold: 0.12 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return createElement(
    as,
    {
      ref,
      className: cn(variantClass[variant], delayClass[delay], className),
    },
    children,
  )
}
