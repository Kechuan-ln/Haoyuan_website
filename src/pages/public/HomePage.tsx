import { Link } from 'react-router-dom'
import {
  Building2,
  Target,
  Handshake,
  Shield,
  Heart,
  ShieldCheck,
  HardHat,
  BarChart3,
  Calculator,
  FileText,
  LayoutDashboard,
  MessageSquare,
  ArrowRight,
  Award,
  CheckCircle,
  Calendar,
  Briefcase,
} from 'lucide-react'
import { COMPANY } from '@/config/constants'
import { ROUTES } from '@/config/routes'

const VALUES = [
  { label: '专业', icon: Target, description: '以精湛技术立身' },
  { label: '共赢', icon: Handshake, description: '与客户共创价值' },
  { label: '责任', icon: Shield, description: '对品质负责到底' },
  { label: '诚信', icon: Heart, description: '以诚信赢得信赖' },
]

const THREE_NO_WORRIES = [
  {
    title: '质量零事故',
    icon: ShieldCheck,
    description: '严格把控工程质量，建立全过程质量管控体系，确保每一个环节都符合国家标准和行业规范。',
  },
  {
    title: '安全无隐患',
    icon: HardHat,
    description: '贯彻安全生产责任制，落实安全防护措施，打造零隐患施工环境，保障人员与财产安全。',
  },
  {
    title: '进度可视化',
    icon: BarChart3,
    description: '运用数字化管理工具，实时跟踪项目进度，让客户随时掌握工程动态，做到心中有数。',
  },
]

const SERVICES = [
  {
    title: '工程造价',
    icon: Calculator,
    description: '工程造价咨询、预算编制、结算审核，精准把控项目成本。',
    id: 'cost',
  },
  {
    title: '招标代理',
    icon: FileText,
    description: '招标方案编制、评标组织、合同谈判，规范高效的招标流程。',
    id: 'bidding-agent',
  },
  {
    title: '工程监理',
    icon: Shield,
    description: '施工阶段监理、质量安全管控，全方位保障工程品质。',
    id: 'supervision',
  },
  {
    title: '项目管理',
    icon: LayoutDashboard,
    description: '项目全过程管理、进度协调，确保工程按期保质完成。',
    id: 'management',
  },
  {
    title: '工程咨询',
    icon: MessageSquare,
    description: '可行性研究、技术咨询，为工程决策提供专业支持。',
    id: 'consulting',
  },
]

const FEATURED_PROJECTS = [
  {
    title: '深圳市宝安区福永人民医院消化内镜中心改造工程',
    category: '医疗',
    scope: '工程造价咨询及全过程项目管理服务',
  },
  {
    title: '华兴光伏发电项目工程',
    category: '光伏',
    scope: '工程监理及质量安全管控服务',
  },
  {
    title: '中山大学深圳校区人才保障性住房安居澜庭装修工程',
    category: '住房',
    scope: '招标代理及工程造价咨询服务',
  },
  {
    title: '中国科学院深圳理工大学明珠校区项目',
    category: '教育',
    scope: '全过程工程咨询及项目管理服务',
  },
]

const STATS = [
  { value: '50+', label: '项目经验', icon: Briefcase },
  { value: '100%', label: '合格率', icon: CheckCircle },
  { value: '5+', label: '业务领域', icon: Award },
  { value: '2021', label: '成立年份', icon: Calendar },
]

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-navy via-navy to-navy-dark text-white py-24 sm:py-32 px-4 overflow-hidden">
        {/* Decorative geometric pattern */}
        <div className="absolute inset-0 opacity-[0.06]">
          <div className="absolute top-10 left-10 w-40 h-40 border-2 border-white rotate-45" />
          <div className="absolute top-32 right-20 w-24 h-24 border-2 border-white rotate-12" />
          <div className="absolute bottom-20 left-1/4 w-32 h-32 border-2 border-white -rotate-12" />
          <div className="absolute bottom-10 right-1/3 w-20 h-20 border-2 border-white rotate-45" />
          <div className="absolute top-1/2 right-10 w-48 h-48 border-2 border-white rotate-[30deg]" />
        </div>
        {/* Building silhouette */}
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
              to={ROUTES.SERVICES}
              className="inline-flex items-center gap-2 rounded-lg bg-gold px-8 py-3.5 text-sm font-semibold text-navy transition-all hover:bg-gold-light hover:shadow-lg hover:shadow-gold/20"
            >
              了解我们的业务
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to={ROUTES.BIDDING}
              className="inline-flex items-center gap-2 rounded-lg border-2 border-white/30 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/10 hover:border-white/50"
            >
              招标大厅
            </Link>
          </div>
        </div>
      </section>

      {/* Brand Values Strip */}
      <section className="bg-gradient-to-r from-gold-dark via-gold to-gold-dark py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8">
            {VALUES.map((v) => (
              <div key={v.label} className="flex items-center justify-center gap-3 text-navy">
                <v.icon className="w-6 h-6 shrink-0" />
                <div>
                  <span className="text-lg font-bold">{v.label}</span>
                  <p className="text-xs text-navy/70 hidden sm:block">{v.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 全程三无忧 Section */}
      <section className="py-20 sm:py-24 px-4 bg-bg-gray">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-navy mb-4">
              "全程三无忧" 服务理念
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              以质量、安全、进度三大维度构建全方位服务保障体系，让客户安心无忧
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {THREE_NO_WORRIES.map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-xl p-8 border-l-4 border-navy shadow-md hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px]"
              >
                <div className="w-14 h-14 bg-navy/10 rounded-xl flex items-center justify-center mb-6">
                  <item.icon className="w-7 h-7 text-navy" />
                </div>
                <h3 className="text-xl font-bold text-navy mb-3">{item.title}</h3>
                <p className="text-text-secondary leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Business Services Section */}
      <section className="py-20 sm:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-navy mb-4">
              五大业务板块
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              覆盖工程建设全生命周期的专业技术服务
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((service) => (
              <Link
                key={service.id}
                to={`${ROUTES.SERVICES}/${service.id}`}
                className="group bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px] border border-border"
              >
                <div className="w-14 h-14 bg-teal/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-teal/20 transition-colors">
                  <service.icon className="w-7 h-7 text-teal" />
                </div>
                <h3 className="text-xl font-bold text-navy mb-3">{service.title}</h3>
                <p className="text-text-secondary leading-relaxed mb-4">{service.description}</p>
                <span className="inline-flex items-center gap-1 text-teal text-sm font-medium group-hover:gap-2 transition-all">
                  了解更多
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="py-20 sm:py-24 px-4 bg-bg-gray">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-navy mb-4">
              精选工程业绩
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              深耕工程建设领域，为众多标杆项目提供优质技术服务
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURED_PROJECTS.map((project) => (
              <div
                key={project.title}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px]"
              >
                <div className="h-44 bg-gradient-to-br from-navy/5 to-navy/10 flex items-center justify-center relative">
                  <Building2 className="w-12 h-12 text-navy/20" />
                  <span className="absolute top-3 left-3 bg-teal text-white text-xs font-medium px-3 py-1 rounded-full">
                    {project.category}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-text-primary mb-2 leading-snug line-clamp-2">
                    {project.title}
                  </h3>
                  <p className="text-sm text-text-secondary">{project.scope}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              to={ROUTES.PROJECTS}
              className="inline-flex items-center gap-2 text-teal hover:text-teal-dark transition-colors font-medium"
            >
              查看全部业绩
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-br from-navy via-navy to-navy-dark text-white py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-7 h-7 text-gold" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-gold mb-2">{stat.value}</div>
                <div className="text-white/70 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-24 px-4 bg-bg-gray">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-navy mb-4">
            {COMPANY.fullSlogan}
          </h2>
          <p className="text-text-secondary mb-10 max-w-2xl mx-auto">
            我们期待与您携手合作，以专业技术和优质服务，共同实现工程项目的卓越目标
          </p>
          <Link
            to={ROUTES.CONTACT}
            className="inline-flex items-center gap-2 rounded-lg bg-navy px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-navy-dark hover:shadow-lg"
          >
            联系我们
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
