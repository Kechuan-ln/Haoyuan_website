import { cn } from '@/utils/cn'

interface SectionHeadingProps {
  title: string
  subtitle?: string
  align?: 'center' | 'left'
}

export function SectionHeading({ title, subtitle, align = 'center' }: SectionHeadingProps) {
  const isCenter = align === 'center'

  return (
    <div className={cn('mb-12', isCenter && 'text-center')}>
      <h2 className="text-3xl font-bold text-navy mb-3">{title}</h2>
      <div className={cn('w-16 h-1 bg-gold rounded-full', isCenter && 'mx-auto')} />
      {subtitle && (
        <p className={cn('text-text-secondary mt-4', isCenter && 'max-w-2xl mx-auto')}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
