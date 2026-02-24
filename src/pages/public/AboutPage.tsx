import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2,
  ArrowRight,
  Lightbulb,
  Heart,
  Loader2,
} from 'lucide-react'
import { COMPANY } from '@/config/constants'
import { ROUTES } from '@/config/routes'
import { getIcon } from '@/config/icon-map'
import { getAboutContent } from '@/services/about-content.service'
import { SectionHeading } from '@/components/shared/SectionHeading'
import type { AboutContent } from '@/types/about'

/* ---------- Default Content (fallback when Firestore is empty) ---------- */

const DEFAULT_CONTENT: Omit<AboutContent, 'updatedAt'> = {
  coreValues: [
    { title: '专精创新', iconName: 'Target', colorTheme: 'navy', description: '以专业技术为基础，持续创新服务模式，紧跟行业前沿发展，为客户提供最优解决方案。' },
    { title: '品质为诺', iconName: 'Award', colorTheme: 'gold', description: '坚守质量标准，以品质赢得信赖。每一个项目都以最高标准严格把控，绝不降低品质要求。' },
    { title: '诚协共进', iconName: 'Handshake', colorTheme: 'teal', description: '秉承诚信原则，协同合作共同发展。与客户、合作伙伴建立长期互信的合作关系。' },
    { title: '责任担当', iconName: 'Shield', colorTheme: 'navy', description: '对项目负责，对客户负责，对社会负责。将社会责任融入企业发展的每一个环节。' },
  ],
  threePromises: [
    {
      title: '文明工地典范', iconName: 'CheckCircle',
      description: '严格施工管理，打造文明安全施工环境，做到施工现场整洁有序、安全防护到位。',
      highlights: ['标准化施工流程', '安全文明管理', '环境保护措施'],
    },
    {
      title: '结构品质标杆', iconName: 'Award',
      description: '精益求精，确保工程结构质量达到行业标杆，每一道工序都经过严格检验验收。',
      highlights: ['工序质量验收', '材料严格把关', '结构安全检测'],
    },
    {
      title: '绿色建筑先锋', iconName: 'Leaf',
      description: '践行绿色理念，推动可持续建设发展，积极采用环保材料和节能技术。',
      highlights: ['环保材料应用', '节能技术推广', '绿色施工标准'],
    },
  ],
  milestones: [
    { year: '2021', event: '公司在深圳市光明区注册成立' },
    { year: '2022', event: '取得工程监理乙级资质，业务初具规模' },
    { year: '2023', event: '通过ISO三体系认证，服务能力全面提升' },
    { year: '2024', event: '获得AAA级信用等级，项目业绩突破50+' },
  ],
}

/* ---------- Helpers ---------- */

function getColorClasses(theme: string) {
  switch (theme) {
    case 'navy':
      return { text: 'text-navy', bgLight: 'bg-navy/10' }
    case 'teal':
      return { text: 'text-teal', bgLight: 'bg-teal/10' }
    case 'gold':
      return { text: 'text-gold-dark', bgLight: 'bg-gold/10' }
    default:
      return { text: 'text-navy', bgLight: 'bg-navy/10' }
  }
}

/* ---------- Component ---------- */

export default function AboutPage() {
  const [content, setContent] = useState<Omit<AboutContent, 'updatedAt'> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getAboutContent()
        if (data) {
          setContent({
            coreValues: data.coreValues?.length ? data.coreValues : DEFAULT_CONTENT.coreValues,
            threePromises: data.threePromises?.length ? data.threePromises : DEFAULT_CONTENT.threePromises,
            milestones: data.milestones?.length ? data.milestones : DEFAULT_CONTENT.milestones,
          })
        } else {
          setContent(DEFAULT_CONTENT)
        }
      } catch {
        setContent(DEFAULT_CONTENT)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading || !content) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 text-navy animate-spin mb-4" />
        <p className="text-sm text-text-secondary">加载中...</p>
      </div>
    )
  }

  const CheckCircleIcon = getIcon('CheckCircle')

  return (
    <div>
      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-navy via-navy to-navy-dark text-white py-20 sm:py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05]">
          <div className="absolute top-8 right-16 w-32 h-32 border-2 border-white rotate-45" />
          <div className="absolute bottom-12 left-20 w-24 h-24 border-2 border-white rotate-12" />
        </div>
        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">关于我们</h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            了解全程创优的企业文化与发展理念
          </p>
        </div>
      </section>

      {/* Company Introduction */}
      <section className="py-20 sm:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-navy/5 rounded-full px-4 py-2 mb-6">
                <Building2 className="w-4 h-4 text-navy" />
                <span className="text-sm text-navy font-medium">企业背景</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-navy mb-6">
                {COMPANY.name}
              </h2>
              <p className="text-text-secondary leading-relaxed mb-6">
                {COMPANY.name}成立于{COMPANY.foundedYear}年，位于深圳市光明区。
                公司专注于工程建设全过程技术服务，涵盖工程造价咨询、招标代理、
                工程监理、项目管理及工程咨询等五大核心业务领域。
              </p>
              <p className="text-text-secondary leading-relaxed mb-6">
                自成立以来，公司始终秉承"{COMPANY.slogan}"的企业理念，以专业的技术团队、
                规范的管理体系和优质的服务品质，赢得了客户的广泛认可和信赖。我们的项目涵盖
                医疗、教育、住房、光伏、产业园等多个领域，已成功完成50余项工程项目。
              </p>
              <div className="flex flex-wrap gap-3">
                {COMPANY.values.map((v) => (
                  <span
                    key={v}
                    className="inline-flex items-center gap-1 bg-gold/10 text-gold-dark text-sm font-medium px-4 py-2 rounded-full"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    {v}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-navy/5 to-navy/10 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[360px]">
              <Building2 className="w-20 h-20 text-navy/20 mb-6" />
              <span className="text-text-muted text-sm">企业形象展示</span>
            </div>
          </div>
        </div>
      </section>

      {/* Development Milestones */}
      <section className="py-20 sm:py-24 px-4 bg-bg-gray">
        <div className="max-w-7xl mx-auto">
          <SectionHeading title="发展历程" subtitle="稳步前行，持续成长" />
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-0.5 bg-navy/20" />
              <div className="space-y-8">
                {content.milestones.map((m) => (
                  <div key={m.year} className="flex gap-6 items-start relative">
                    <div className="relative z-10 w-12 sm:w-16 h-12 sm:h-16 bg-navy rounded-xl flex items-center justify-center shrink-0">
                      <span className="text-white font-bold text-xs sm:text-sm">{m.year}</span>
                    </div>
                    <div className="bg-white rounded-xl p-5 shadow-md flex-1 mt-1">
                      <p className="text-text-primary font-medium">{m.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-20 sm:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <SectionHeading title="核心价值观" subtitle="以专业、诚信、创新、责任为核心，构建企业发展的坚实基础" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {content.coreValues.map((value) => {
              const Icon = getIcon(value.iconName)
              const colors = getColorClasses(value.colorTheme)
              return (
                <div
                  key={value.title}
                  className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px] border border-border"
                >
                  <div className={`w-14 h-14 ${colors.bgLight} rounded-xl flex items-center justify-center mb-6`}>
                    <Icon className={`w-7 h-7 ${colors.text}`} />
                  </div>
                  <h3 className="text-xl font-bold text-navy mb-3">{value.title}</h3>
                  <p className="text-text-secondary leading-relaxed text-sm">{value.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 创优三承诺 Section */}
      <section className="py-20 sm:py-24 px-4 bg-bg-gray">
        <div className="max-w-7xl mx-auto">
          <SectionHeading title='"创优三承诺"' subtitle="文明工地、品质标杆、绿色先锋，以三大承诺践行企业使命" />
          <div className="grid sm:grid-cols-3 gap-8">
            {content.threePromises.map((promise) => {
              const PromiseIcon = getIcon(promise.iconName)
              return (
                <div
                  key={promise.title}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px]"
                >
                  <div className="bg-gradient-to-r from-navy to-navy-dark p-6">
                    <PromiseIcon className="w-10 h-10 text-gold mb-3" />
                    <h3 className="text-xl font-bold text-white">{promise.title}</h3>
                  </div>
                  <div className="p-6">
                    <p className="text-text-secondary leading-relaxed mb-4">{promise.description}</p>
                    <ul className="space-y-2">
                      {promise.highlights.map((h) => (
                        <li key={h} className="flex items-center gap-2 text-sm text-text-secondary">
                          <CheckCircleIcon className="w-4 h-4 text-teal shrink-0" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Company Vision */}
      <section className="py-20 sm:py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-br from-navy/5 to-navy/10 rounded-2xl p-10 sm:p-14">
            <div className="absolute top-6 left-8 text-6xl font-serif text-gold/30 leading-none">"</div>
            <div className="relative text-center">
              <Heart className="w-10 h-10 text-gold mx-auto mb-6" />
              <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-4">
                企业愿景
              </h2>
              <p className="text-xl sm:text-2xl text-navy font-medium mb-6">
                {COMPANY.fullSlogan}
              </p>
              <p className="text-text-secondary max-w-2xl mx-auto leading-relaxed">
                我们致力于成为工程建设技术服务领域最受信赖的合作伙伴，以专业能力和诚信品质，
                为每一个项目创造卓越价值，与客户共同成长，共创美好未来。
              </p>
            </div>
            <div className="absolute bottom-6 right-8 text-6xl font-serif text-gold/30 leading-none rotate-180">"</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-navy to-navy-dark text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            期待与您携手合作
          </h2>
          <p className="text-white/70 mb-8">
            了解更多关于我们的业务和服务
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to={ROUTES.SERVICES}
              className="inline-flex items-center gap-2 rounded-lg bg-gold px-8 py-3.5 text-sm font-semibold text-navy transition-all hover:bg-gold-light"
            >
              业务范围
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to={ROUTES.CONTACT}
              className="inline-flex items-center gap-2 rounded-lg border-2 border-white/30 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/10"
            >
              联系我们
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
