import { Link } from 'react-router-dom'
import type { ComponentType } from 'react'
import { cn } from '@/utils/cn'

interface CTASectionProps {
  title: string
  subtitle?: string
  variant?: 'navy-bg' | 'light-bg'
  primaryAction: {
    label: string
    href: string
    icon?: ComponentType<{ className?: string }>
  }
  secondaryAction?: { label: string; href: string }
  /** When true the CTA renders as a rounded card inside section padding. */
  inset?: boolean
}

export default function CTASection({
  title,
  subtitle,
  variant = 'navy-bg',
  primaryAction,
  secondaryAction,
  inset = false,
}: CTASectionProps) {
  const isNavy = variant === 'navy-bg'

  const content = (
    <div
      className={cn(
        isNavy
          ? 'bg-gradient-to-r from-navy to-navy-dark text-white'
          : 'bg-bg-gray text-navy',
        inset ? 'rounded-2xl p-10 sm:p-14' : 'py-16 px-4',
      )}
    >
      <div className={cn('text-center', !inset && 'max-w-4xl mx-auto')}>
        <h2
          className={cn(
            'text-2xl sm:text-3xl font-bold mb-4',
            !isNavy && 'text-navy',
          )}
        >
          {title}
        </h2>

        {subtitle && (
          <p
            className={cn(
              'mb-8 max-w-xl mx-auto',
              isNavy ? 'text-white/70' : 'text-text-secondary',
            )}
          >
            {subtitle}
          </p>
        )}

        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to={primaryAction.href}
            className="inline-flex items-center gap-2 rounded-lg bg-gold px-8 py-3.5 text-sm font-semibold text-navy transition-all hover:bg-gold-light hover:shadow-lg hover:shadow-gold/20"
          >
            {primaryAction.icon && <primaryAction.icon className="w-4 h-4" />}
            {primaryAction.label}
          </Link>

          {secondaryAction && (
            <Link
              to={secondaryAction.href}
              className={cn(
                'inline-flex items-center gap-2 rounded-lg border-2 px-8 py-3.5 text-sm font-semibold transition-all',
                isNavy
                  ? 'border-white/40 text-white hover:bg-white/10'
                  : 'border-navy/30 text-navy hover:bg-navy/5',
              )}
            >
              {secondaryAction.label}
            </Link>
          )}
        </div>
      </div>
    </div>
  )

  if (inset) {
    return (
      <section className="py-20 sm:py-24 px-4">
        <div className="max-w-4xl mx-auto">{content}</div>
      </section>
    )
  }

  return <section>{content}</section>
}
