import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Shield,
  Award,
  BadgeCheck,
  CheckCircle,
  ArrowRight,
  Star,
  Briefcase,
  Building2,
  Leaf,
  HardHat,
} from 'lucide-react'
import { COMPANY } from '@/config/constants'
import { ROUTES } from '@/config/routes'
import { DEFAULT_QUALIFICATIONS } from '@/config/qualification-defaults'
import { getQualifications } from '@/services/qualifications.service'
import { getIcon } from '@/config/icon-map'
import { CardSkeleton } from '@/components/shared/Skeleton'
import { SectionHeading } from '@/components/shared/SectionHeading'
import HeroSection from '@/components/shared/HeroSection'
import AnimatedSection from '@/components/shared/AnimatedSection'
import type { Qualification } from '@/types/qualification'

/* ---------- Stagger delays ---------- */

const STAGGER_DELAYS = [0, 100, 200, 300, 400] as const


const TRUST_STATS = [
  { value: '8+', label: '权威资质认证', icon: BadgeCheck },
  { value: 'ISO', label: '三体系认证', icon: Shield },
  { value: 'AAA', label: '信用等级', icon: Award },
  { value: 'AAAA', label: '标准化工地', icon: Star },
]

function getColorClasses(theme: string) {
  switch (theme) {
    case 'teal': return { bg: 'bg-teal/10', text: 'text-teal' }
    case 'gold': return { bg: 'bg-gold/10', text: 'text-gold-dark' }
    default: return { bg: 'bg-navy/10', text: 'text-navy' }
  }
}

export default function QualificationsPage() {
  const [qualifications, setQualifications] = useState<Omit<Qualification, 'id' | 'createdAt' | 'updatedAt'>[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getQualifications({ isPublished: true })
        setQualifications(data.length > 0 ? data : DEFAULT_QUALIFICATIONS)
      } catch {
        setQualifications(DEFAULT_QUALIFICATIONS)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div>
      {/* Hero Banner */}
      <HeroSection
        title="企业资质"
        subtitle="全方位的资质认证，彰显专业实力"
        decorationCount={2}
      />

      {/* Trust Stats */}
      <section className="bg-gradient-to-r from-gold-dark via-gold to-gold-dark py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8">
            {TRUST_STATS.map((stat) => (
              <div key={stat.label} className="flex items-center justify-center gap-3 text-navy">
                <stat.icon className="w-6 h-6 shrink-0" />
                <div>
                  <span className="text-lg font-bold">{stat.value}</span>
                  <p className="text-xs text-navy/70">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications Gallery */}
      <section className="py-20 sm:py-24 px-4 bg-bg-gray">
        <div className="max-w-7xl mx-auto">
          <SectionHeading title="资质证书一览" subtitle="完善的资质认证体系，为优质服务提供坚实保障" />
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {qualifications.map((cert, i) => {
                const Icon = getIcon(cert.iconName)
                const colors = getColorClasses(cert.colorTheme)
                return (
                  <AnimatedSection
                    key={cert.title}
                    delay={STAGGER_DELAYS[i % 3]}
                  >
                    <div className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px] cursor-pointer border border-border h-full">
                      <div className="h-48 bg-gradient-to-br from-navy/5 to-navy/10 flex flex-col items-center justify-center">
                        <div className={`w-16 h-16 ${colors.bg} rounded-xl flex items-center justify-center mb-3`}>
                          <Icon className={`w-8 h-8 ${colors.text}`} />
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-text-primary mb-1">{cert.title}</h3>
                        <p className="text-sm text-teal font-medium mb-3">{cert.issuer}</p>
                        <p className="text-sm text-text-secondary leading-relaxed">{cert.description}</p>
                      </div>
                    </div>
                  </AnimatedSection>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ISO Triple System Highlight */}
      <section className="py-20 sm:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <SectionHeading title="ISO 三体系认证" subtitle="质量、环境、职业健康安全三大管理体系全面达标" />
          <div className="grid sm:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <AnimatedSection delay={0}>
              <div className="bg-white rounded-xl p-8 border-l-4 border-navy shadow-md text-center h-full">
                <BadgeCheck className="w-12 h-12 text-navy mx-auto mb-4" />
                <h3 className="text-lg font-bold text-navy mb-2">ISO 9001</h3>
                <p className="text-sm text-text-secondary">质量管理体系</p>
                <p className="text-xs text-text-muted mt-2">确保服务质量标准化、可追溯</p>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={100}>
              <div className="bg-white rounded-xl p-8 border-l-4 border-teal shadow-md text-center h-full">
                <Leaf className="w-12 h-12 text-teal mx-auto mb-4" />
                <h3 className="text-lg font-bold text-teal mb-2">ISO 14001</h3>
                <p className="text-sm text-text-secondary">环境管理体系</p>
                <p className="text-xs text-text-muted mt-2">践行绿色建设，保护生态环境</p>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={200}>
              <div className="bg-white rounded-xl p-8 border-l-4 border-gold shadow-md text-center h-full">
                <HardHat className="w-12 h-12 text-gold-dark mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gold-dark mb-2">ISO 45001</h3>
                <p className="text-sm text-text-secondary">职业健康安全管理体系</p>
                <p className="text-xs text-text-muted mt-2">保障安全生产，关爱员工健康</p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Why Trust Us — kept raw (unique layout with embedded stats grid) */}
      <section className="py-20 sm:py-24 px-4 bg-gradient-to-br from-navy via-navy to-navy-dark text-white">
        <div className="max-w-4xl mx-auto text-center">
          <Award className="w-14 h-14 text-gold mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">为什么选择我们</h2>
          <p className="text-lg text-white/80 leading-relaxed mb-10 max-w-3xl mx-auto">
            这些资质和认证代表了我们对专业品质的持续追求。
            {COMPANY.name}以完善的管理体系、专业的技术团队和优质的服务品质，
            赢得了客户和行业的广泛认可。
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-12">
            <div className="text-center">
              <Briefcase className="w-8 h-8 text-gold mx-auto mb-2" />
              <div className="text-2xl font-bold text-gold">50+</div>
              <div className="text-sm text-white/60">成功项目</div>
            </div>
            <div className="text-center">
              <CheckCircle className="w-8 h-8 text-gold mx-auto mb-2" />
              <div className="text-2xl font-bold text-gold">100%</div>
              <div className="text-sm text-white/60">验收合格率</div>
            </div>
            <div className="text-center">
              <Building2 className="w-8 h-8 text-gold mx-auto mb-2" />
              <div className="text-2xl font-bold text-gold">5+</div>
              <div className="text-sm text-white/60">行业领域</div>
            </div>
            <div className="text-center">
              <Shield className="w-8 h-8 text-gold mx-auto mb-2" />
              <div className="text-2xl font-bold text-gold">0</div>
              <div className="text-sm text-white/60">安全事故</div>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to={ROUTES.PROJECTS}
              className="inline-flex items-center gap-2 rounded-lg bg-gold px-8 py-3.5 text-sm font-semibold text-navy transition-all hover:bg-gold-light"
            >
              查看工程业绩
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to={ROUTES.CONTACT}
              className="inline-flex items-center gap-2 rounded-lg border-2 border-white/40 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/10"
            >
              联系我们
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
