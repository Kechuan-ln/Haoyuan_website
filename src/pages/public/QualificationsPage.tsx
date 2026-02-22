import { Link } from 'react-router-dom'
import {
  Shield,
  Award,
  BadgeCheck,
  FileCheck,
  CheckCircle,
  ArrowRight,
  Star,
  Briefcase,
  Building2,
  Leaf,
  HardHat,
  Heart,
  Search,
} from 'lucide-react'
import { COMPANY } from '@/config/constants'
import { ROUTES } from '@/config/routes'

const CERTIFICATIONS = [
  {
    title: '营业执照',
    issuer: '深圳市市场监督管理局',
    description: '广东全程创优建设技术有限公司，依法注册经营工程建设技术服务',
    icon: FileCheck,
    iconColor: 'text-navy',
    iconBg: 'bg-navy/10',
  },
  {
    title: '工程监理乙级资质',
    issuer: '住房和城乡建设部',
    description: '具备工程监理乙级资质，可承担相应规模的工程监理业务',
    icon: Shield,
    iconColor: 'text-teal',
    iconBg: 'bg-teal/10',
  },
  {
    title: 'ISO 9001 质量管理体系认证',
    issuer: '国际标准化组织认证',
    description: '建立完善的质量管理体系，确保服务品质持续稳定提升',
    icon: BadgeCheck,
    iconColor: 'text-navy',
    iconBg: 'bg-navy/10',
  },
  {
    title: 'ISO 14001 环境管理体系认证',
    issuer: '国际标准化组织认证',
    description: '践行绿色环保理念，规范环境管理，减少施工环境影响',
    icon: Leaf,
    iconColor: 'text-teal',
    iconBg: 'bg-teal/10',
  },
  {
    title: 'ISO 45001 职业健康安全管理体系认证',
    issuer: '国际标准化组织认证',
    description: '保障员工职业健康与安全，建立完善的安全管理制度',
    icon: HardHat,
    iconColor: 'text-gold-dark',
    iconBg: 'bg-gold/10',
  },
  {
    title: 'AAAA 级标准化工地认证',
    issuer: '行业协会认证',
    description: '施工现场标准化管理达到AAAA级标准，彰显文明施工水平',
    icon: Star,
    iconColor: 'text-gold-dark',
    iconBg: 'bg-gold/10',
  },
  {
    title: '售后服务认证',
    issuer: '国家认证认可监督管理委员会',
    description: '完善的售后服务体系，为客户提供持续的技术支持与服务保障',
    icon: Heart,
    iconColor: 'text-teal',
    iconBg: 'bg-teal/10',
  },
  {
    title: 'AAA 级信用等级证书',
    issuer: '信用评级机构',
    description: '企业信用等级达到AAA级最高标准，诚信经营获得权威认可',
    icon: Award,
    iconColor: 'text-navy',
    iconBg: 'bg-navy/10',
  },
]

const TRUST_STATS = [
  { value: '8+', label: '权威资质认证', icon: BadgeCheck },
  { value: 'ISO', label: '三体系认证', icon: Shield },
  { value: 'AAA', label: '信用等级', icon: Award },
  { value: 'AAAA', label: '标准化工地', icon: Star },
]

export default function QualificationsPage() {
  return (
    <div>
      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-navy via-navy to-navy-dark text-white py-20 sm:py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05]">
          <div className="absolute top-8 right-16 w-32 h-32 border-2 border-white rotate-45" />
          <div className="absolute bottom-12 left-20 w-24 h-24 border-2 border-white rotate-12" />
        </div>
        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">资质荣誉</h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            全方位的资质认证，彰显专业实力
          </p>
        </div>
      </section>

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
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-navy mb-4">资质证书一览</h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              完善的资质认证体系，为优质服务提供坚实保障
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CERTIFICATIONS.map((cert) => (
              <div
                key={cert.title}
                className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"
              >
                {/* Certificate Image Placeholder */}
                <div className="h-48 bg-gradient-to-br from-navy/5 to-navy/10 flex flex-col items-center justify-center relative">
                  <div className={`w-16 h-16 ${cert.iconBg} rounded-xl flex items-center justify-center mb-3`}>
                    <cert.icon className={`w-8 h-8 ${cert.iconColor}`} />
                  </div>
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-navy/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-center gap-2 text-white text-sm font-medium">
                      <Search className="w-4 h-4" />
                      点击查看大图
                    </div>
                  </div>
                </div>
                {/* Content */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-text-primary mb-1">{cert.title}</h3>
                  <p className="text-sm text-teal font-medium mb-3">{cert.issuer}</p>
                  <p className="text-sm text-text-secondary leading-relaxed">{cert.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ISO Triple System Highlight */}
      <section className="py-20 sm:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-navy mb-4">ISO 三体系认证</h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              质量、环境、职业健康安全三大管理体系全面达标
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-xl p-8 border-l-4 border-navy shadow-md text-center">
              <BadgeCheck className="w-12 h-12 text-navy mx-auto mb-4" />
              <h3 className="text-lg font-bold text-navy mb-2">ISO 9001</h3>
              <p className="text-sm text-text-secondary">质量管理体系</p>
              <p className="text-xs text-text-muted mt-2">确保服务质量标准化、可追溯</p>
            </div>
            <div className="bg-white rounded-xl p-8 border-l-4 border-teal shadow-md text-center">
              <Leaf className="w-12 h-12 text-teal mx-auto mb-4" />
              <h3 className="text-lg font-bold text-teal mb-2">ISO 14001</h3>
              <p className="text-sm text-text-secondary">环境管理体系</p>
              <p className="text-xs text-text-muted mt-2">践行绿色建设，保护生态环境</p>
            </div>
            <div className="bg-white rounded-xl p-8 border-l-4 border-gold shadow-md text-center">
              <HardHat className="w-12 h-12 text-gold-dark mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gold-dark mb-2">ISO 45001</h3>
              <p className="text-sm text-text-secondary">职业健康安全管理体系</p>
              <p className="text-xs text-text-muted mt-2">保障安全生产，关爱员工健康</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Trust Us */}
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
