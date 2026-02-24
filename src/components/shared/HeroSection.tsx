import type { ComponentType, ReactNode } from 'react'

interface HeroSectionProps {
  title: string
  subtitle?: string
  badge?: { icon: ComponentType<{ className?: string }>; text: string }
  children?: ReactNode
  /** Number of geometric decorations: 2 (minimal), 4 (standard), or 5 (dense). Default 4. */
  decorationCount?: 2 | 4 | 5
}

/* ---------- Decorations ---------- */

function Decorations2() {
  return (
    <div className="absolute inset-0 opacity-[0.06]">
      <div className="absolute top-8 right-16 w-32 h-32 border-2 border-white rotate-45" />
      <div className="absolute bottom-12 left-20 w-24 h-24 border-2 border-white rotate-12" />
    </div>
  )
}

function Decorations4() {
  return (
    <div className="absolute inset-0 opacity-[0.06]">
      <div className="absolute top-10 left-10 w-40 h-40 border-2 border-white rotate-45" />
      <div className="absolute top-32 right-20 w-24 h-24 border-2 border-white rotate-12" />
      <div className="absolute bottom-20 left-1/4 w-32 h-32 border-2 border-white -rotate-12" />
      <div className="absolute bottom-10 right-1/3 w-20 h-20 border-2 border-white rotate-45" />
    </div>
  )
}

function Decorations5() {
  return (
    <div className="absolute inset-0 opacity-[0.06]">
      <div className="absolute top-10 left-10 w-40 h-40 border-2 border-white rotate-45" />
      <div className="absolute top-32 right-20 w-24 h-24 border-2 border-white rotate-12" />
      <div className="absolute bottom-20 left-1/4 w-32 h-32 border-2 border-white -rotate-12" />
      <div className="absolute bottom-10 right-1/3 w-20 h-20 border-2 border-white rotate-45" />
      <div className="absolute top-1/2 right-10 w-48 h-48 border-2 border-white rotate-[30deg]" />
    </div>
  )
}

const decorationMap = {
  2: Decorations2,
  4: Decorations4,
  5: Decorations5,
}

/* ---------- Component ---------- */

export default function HeroSection({
  title,
  subtitle,
  badge,
  children,
  decorationCount = 4,
}: HeroSectionProps) {
  const Deco = decorationMap[decorationCount]

  return (
    <section className="relative bg-gradient-to-br from-navy via-navy to-navy-dark text-white py-20 sm:py-28 px-4 overflow-hidden">
      <Deco />

      <div className="relative max-w-7xl mx-auto text-center animate-[fadeIn_0.8s_ease-out]">
        {badge && (
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-6">
            <badge.icon className="w-4 h-4 text-gold" />
            <span className="text-sm text-white/90">{badge.text}</span>
          </div>
        )}

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight">
          {title}
        </h1>

        {subtitle && (
          <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        )}

        {children}
      </div>
    </section>
  )
}
