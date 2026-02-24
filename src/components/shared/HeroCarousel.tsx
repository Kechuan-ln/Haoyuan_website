import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Building2, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { COMPANY } from '@/config/constants'
import { ROUTES } from '@/config/routes'
import type { HeroSlide } from '@/types/contact'

interface HeroCarouselProps {
  slides: HeroSlide[]
  interval?: number
}

export function HeroCarousel({ slides, interval = 5000 }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0)
  const paused = useRef(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const count = slides.length

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (count <= 1) return
    timerRef.current = setInterval(() => {
      if (!paused.current) setCurrent((i) => (i + 1) % count)
    }, interval)
  }, [count, interval])

  const next = useCallback(() => {
    if (count <= 1) return
    setCurrent((i) => (i + 1) % count)
    resetTimer()
  }, [count, resetTimer])

  const prev = useCallback(() => {
    if (count <= 1) return
    setCurrent((i) => (i - 1 + count) % count)
    resetTimer()
  }, [count, resetTimer])

  const goTo = useCallback((idx: number) => {
    setCurrent(idx)
    resetTimer()
  }, [resetTimer])

  /* auto-play */
  useEffect(() => {
    resetTimer()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [resetTimer])

  /* ---------- fallback: static hero ---------- */
  if (count === 0) {
    return (
      <section className="relative bg-gradient-to-br from-navy via-navy to-navy-dark text-white h-[500px] sm:h-[560px] md:h-[620px] px-4 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 opacity-[0.06]">
          <div className="absolute top-10 left-10 w-40 h-40 border-2 border-white rotate-45" />
          <div className="absolute top-32 right-20 w-24 h-24 border-2 border-white rotate-12" />
          <div className="absolute bottom-20 left-1/4 w-32 h-32 border-2 border-white -rotate-12" />
          <div className="absolute bottom-10 right-1/3 w-20 h-20 border-2 border-white rotate-45" />
          <div className="absolute top-1/2 right-10 w-48 h-48 border-2 border-white rotate-[30deg]" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 opacity-[0.04]">
          <div className="flex items-end justify-center gap-1 h-40">
            <div className="w-12 bg-white h-20" />
            <div className="w-8 bg-white h-32" />
            <div className="w-16 bg-white h-28" />
            <div className="w-10 bg-white h-36" />
            <div className="w-14 bg-white h-24" />
            <div className="w-8 bg-white h-40" />
            <div className="w-12 bg-white h-30" />
            <div className="w-10 bg-white h-22" />
            <div className="w-16 bg-white h-34" />
            <div className="w-8 bg-white h-26" />
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto text-center animate-[fadeIn_0.8s_ease-out]">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-8">
            <Building2 className="w-4 h-4 text-gold" />
            <span className="text-sm text-white/90">专业工程建设全过程技术服务</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
            {COMPANY.name}
          </h1>
          <p className="text-xl sm:text-2xl text-gold font-medium mb-4">
            {COMPANY.slogan}
          </p>
          <p className="text-base sm:text-lg text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
            致力于为客户提供专业的工程建设全过程技术服务，涵盖工程造价、招标代理、工程监理、项目管理及工程咨询五大核心业务领域
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to={ROUTES.ABOUT}
              className="inline-flex items-center gap-2 rounded-lg border-2 border-white/50 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/10 hover:border-white/70"
            >
              了解我们
            </Link>
            <Link
              to={ROUTES.CONTACT}
              className="inline-flex items-center gap-2 rounded-lg bg-gold px-8 py-3.5 text-sm font-semibold text-navy transition-all hover:bg-gold-light hover:shadow-lg hover:shadow-gold/20"
            >
              联系咨询
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    )
  }

  /* ---------- carousel ---------- */
  return (
    <section
      className="relative h-[500px] sm:h-[560px] md:h-[620px] overflow-hidden"
      onMouseEnter={() => { paused.current = true }}
      onMouseLeave={() => { paused.current = false }}
    >
      {/* slides */}
      {slides.map((slide, idx) => (
        <div
          key={slide.title || idx}
          className={`absolute inset-0 transition-opacity duration-300 ${
            idx === current ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'
          }`}
        >
          {/* background */}
          {slide.imageUrl ? (
            <>
              <img
                src={slide.imageUrl}
                alt={slide.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/70 via-navy/40 to-navy/20" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy to-navy-dark" />
          )}

          {/* content */}
          <div className="relative h-full flex flex-col items-center justify-center text-center text-white px-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight drop-shadow-lg max-w-4xl">
              {slide.title}
            </h2>
            {slide.subtitle && (
              <p className="text-lg sm:text-xl md:text-2xl text-white/80 mb-10 max-w-2xl drop-shadow">
                {slide.subtitle}
              </p>
            )}
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to={slide.linkUrl || ROUTES.ABOUT}
                className="inline-flex items-center gap-2 rounded-lg border-2 border-white/50 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/10 hover:border-white/70"
              >
                了解我们
              </Link>
              <Link
                to={ROUTES.CONTACT}
                className="inline-flex items-center gap-2 rounded-lg bg-gold px-8 py-3.5 text-sm font-semibold text-navy transition-all hover:bg-gold-light hover:shadow-lg hover:shadow-gold/20"
              >
                联系咨询
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* arrows (hidden on mobile) */}
      {count > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex w-10 h-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 transition-colors"
            aria-label="上一张"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex w-10 h-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 transition-colors"
            aria-label="下一张"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* dots */}
      {count > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((s, idx) => (
            <button
              key={s.title || idx}
              onClick={() => goTo(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                idx === current
                  ? 'bg-white w-6'
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`切换到第 ${idx + 1} 张`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
