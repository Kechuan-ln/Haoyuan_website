import { Link } from 'react-router-dom'
import {
  Target,
  Settings,
  GitBranch,
  Users,
  Briefcase,
  BarChart3,
  Building2,
  DollarSign,
  FileText,
  Shield,
  ArrowRight,
  CheckCircle,
  Award,
  Heart,
} from 'lucide-react'
import { COMPANY } from '@/config/constants'
import { ROUTES } from '@/config/routes'

const THREE_PILLARS = [
  {
    title: '战略决策组',
    icon: Target,
    color: 'bg-navy',
    textColor: 'text-navy',
    bgColor: 'bg-navy/10',
    description: '公司战略规划与重大决策',
    subItems: [
      '企业发展战略规划',
      '重大项目决策审批',
      '资源统筹调配',
      '风险管控决策',
    ],
  },
  {
    title: '职能管理中心',
    icon: Settings,
    color: 'bg-teal',
    textColor: 'text-teal',
    bgColor: 'bg-teal/10',
    description: '人力资源、财务、行政、市场等职能管理',
    subItems: [
      '人力资源管理',
      '财务核算与资金管理',
      '行政综合管理',
      '市场开拓与品牌建设',
    ],
  },
  {
    title: '项目执行矩阵',
    icon: GitBranch,
    color: 'bg-gold-dark',
    textColor: 'text-gold-dark',
    bgColor: 'bg-gold/10',
    description: '项目团队矩阵式管理，灵活配置资源',
    subItems: [
      '项目经理负责制',
      '专业技术团队组建',
      '跨部门资源协调',
      '项目绩效考核评估',
    ],
  },
]

const RACI_DATA = [
  {
    letter: 'R',
    label: 'Responsible',
    chinese: '执行',
    description: '谁来执行',
    detail: '负责具体工作任务的执行，确保工作按要求完成',
    color: 'bg-teal',
    textColor: 'text-teal',
    borderColor: 'border-teal',
  },
  {
    letter: 'A',
    label: 'Accountable',
    chinese: '负责',
    description: '谁来负责',
    detail: '对任务最终结果负责，拥有审批和决策权',
    color: 'bg-navy',
    textColor: 'text-navy',
    borderColor: 'border-navy',
  },
  {
    letter: 'C',
    label: 'Consulted',
    chinese: '咨询',
    description: '谁被咨询',
    detail: '在执行前需要征询意见的专家或相关方',
    color: 'bg-gold-dark',
    textColor: 'text-gold-dark',
    borderColor: 'border-gold',
  },
  {
    letter: 'I',
    label: 'Informed',
    chinese: '知会',
    description: '谁被通知',
    detail: '需要被告知进展和结果的相关方',
    color: 'bg-text-secondary',
    textColor: 'text-text-secondary',
    borderColor: 'border-text-secondary',
  },
]

const RACI_MATRIX = [
  {
    task: '项目立项审批',
    roles: { strategy: 'A', function: 'C', project: 'R' },
  },
  {
    task: '技术方案编制',
    roles: { strategy: 'I', function: 'C', project: 'R' },
  },
  {
    task: '质量安全管控',
    roles: { strategy: 'I', function: 'A', project: 'R' },
  },
  {
    task: '进度协调管理',
    roles: { strategy: 'I', function: 'C', project: 'R' },
  },
  {
    task: '成本预算控制',
    roles: { strategy: 'A', function: 'R', project: 'C' },
  },
  {
    task: '人员调配安排',
    roles: { strategy: 'I', function: 'R', project: 'C' },
  },
]

const TEAM_STRENGTHS = [
  {
    icon: Users,
    title: '专业团队',
    description: '拥有一支由注册监理工程师、造价工程师、一级建造师等组成的专业技术团队',
  },
  {
    icon: Award,
    title: '经验丰富',
    description: '团队成员平均拥有10年以上工程建设行业从业经验',
  },
  {
    icon: Heart,
    title: '团队协作',
    description: '矩阵式管理模式确保各专业协同配合，高效交付',
  },
]

const DEPARTMENTS = [
  { icon: DollarSign, name: '造价咨询部' },
  { icon: FileText, name: '招标代理部' },
  { icon: Shield, name: '工程监理部' },
  { icon: Briefcase, name: '项目管理部' },
  { icon: BarChart3, name: '技术咨询部' },
  { icon: Building2, name: '综合管理部' },
]

function getRaciColor(value: string): string {
  switch (value) {
    case 'R': return 'bg-teal text-white'
    case 'A': return 'bg-navy text-white'
    case 'C': return 'bg-gold text-navy'
    case 'I': return 'bg-gray-200 text-text-secondary'
    default: return 'bg-gray-100 text-text-muted'
  }
}

export default function TeamPage() {
  return (
    <div>
      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-navy via-navy to-navy-dark text-white py-20 sm:py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05]">
          <div className="absolute top-8 right-16 w-32 h-32 border-2 border-white rotate-45" />
          <div className="absolute bottom-12 left-20 w-24 h-24 border-2 border-white rotate-12" />
        </div>
        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">组织架构</h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            三支柱管理体系，确保项目高效交付
          </p>
        </div>
      </section>

      {/* Three Pillars Organization Chart */}
      <section className="py-20 sm:py-24 px-4 bg-bg-gray">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-navy mb-4">三支柱管理体系</h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              以战略决策、职能管理、项目执行三大支柱为核心，构建高效组织架构
            </p>
          </div>

          {/* Top: Company name node */}
          <div className="flex justify-center mb-8">
            <div className="bg-gradient-to-r from-navy to-navy-dark text-white rounded-xl px-8 py-4 shadow-lg">
              <div className="flex items-center gap-3">
                <Building2 className="w-6 h-6 text-gold" />
                <span className="font-bold text-lg">{COMPANY.shortName}</span>
              </div>
            </div>
          </div>

          {/* Connecting line down */}
          <div className="flex justify-center mb-2">
            <div className="w-0.5 h-8 bg-navy/30" />
          </div>

          {/* Horizontal connector */}
          <div className="hidden sm:block max-w-4xl mx-auto mb-2">
            <div className="h-0.5 bg-navy/30 mx-16" />
          </div>

          {/* Three vertical connectors */}
          <div className="hidden sm:flex justify-between max-w-4xl mx-auto px-16 mb-2">
            <div className="w-0.5 h-6 bg-navy/30" />
            <div className="w-0.5 h-6 bg-navy/30" />
            <div className="w-0.5 h-6 bg-navy/30" />
          </div>

          {/* Three Pillar Cards */}
          <div className="grid sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {THREE_PILLARS.map((pillar) => (
              <div
                key={pillar.title}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
              >
                <div className={`${pillar.color} p-5`}>
                  <pillar.icon className="w-8 h-8 text-white mb-2" />
                  <h3 className="text-lg font-bold text-white">{pillar.title}</h3>
                  <p className="text-white/80 text-sm mt-1">{pillar.description}</p>
                </div>
                <div className="p-5">
                  <ul className="space-y-3">
                    {pillar.subItems.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-text-secondary">
                        <CheckCircle className={`w-4 h-4 ${pillar.textColor} shrink-0 mt-0.5`} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Department Grid */}
          <div className="mt-14 max-w-4xl mx-auto">
            <h3 className="text-xl font-bold text-navy text-center mb-6">职能部门设置</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {DEPARTMENTS.map((dept) => (
                <div
                  key={dept.name}
                  className="bg-white rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow border border-border"
                >
                  <dept.icon className="w-6 h-6 text-teal mx-auto mb-2" />
                  <span className="text-sm font-medium text-text-primary">{dept.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* RACI Matrix Section */}
      <section className="py-20 sm:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-navy mb-4">RACI 责任矩阵</h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              明确职责分工，确保每一项工作都有清晰的责任归属
            </p>
          </div>

          {/* RACI Legend */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12">
            {RACI_DATA.map((item) => (
              <div
                key={item.letter}
                className={`rounded-xl p-5 border-l-4 ${item.borderColor} bg-white shadow-md`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${item.color} text-white font-bold text-lg`}>
                    {item.letter}
                  </span>
                  <div>
                    <span className="block text-sm font-bold text-text-primary">{item.chinese}</span>
                    <span className="block text-xs text-text-muted">{item.label}</span>
                  </div>
                </div>
                <p className="text-sm text-text-secondary">{item.detail}</p>
              </div>
            ))}
          </div>

          {/* RACI Matrix Table */}
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden border border-border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-navy text-white">
                    <th className="px-6 py-4 text-left text-sm font-semibold">工作任务</th>
                    <th className="px-4 py-4 text-center text-sm font-semibold">战略决策组</th>
                    <th className="px-4 py-4 text-center text-sm font-semibold">职能管理中心</th>
                    <th className="px-4 py-4 text-center text-sm font-semibold">项目执行矩阵</th>
                  </tr>
                </thead>
                <tbody>
                  {RACI_MATRIX.map((row, idx) => (
                    <tr
                      key={row.task}
                      className={idx % 2 === 0 ? 'bg-white' : 'bg-bg-gray'}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-text-primary">{row.task}</td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold ${getRaciColor(row.roles.strategy)}`}>
                          {row.roles.strategy}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold ${getRaciColor(row.roles.function)}`}>
                          {row.roles.function}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold ${getRaciColor(row.roles.project)}`}>
                          {row.roles.project}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="max-w-4xl mx-auto mt-6">
            <p className="text-sm text-text-muted text-center">
              RACI矩阵为项目管理中明确职责的重要工具，确保各环节工作责任清晰、协作高效
            </p>
          </div>
        </div>
      </section>

      {/* Team Culture */}
      <section className="py-20 sm:py-24 px-4 bg-bg-gray">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-navy mb-4">团队文化</h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              全程创优的每一位成员都以专业和责任为核心价值
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {TEAM_STRENGTHS.map((strength) => (
              <div
                key={strength.title}
                className="bg-white rounded-xl p-8 text-center shadow-md hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px]"
              >
                <div className="w-16 h-16 bg-navy/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <strength.icon className="w-8 h-8 text-navy" />
                </div>
                <h3 className="text-xl font-bold text-navy mb-3">{strength.title}</h3>
                <p className="text-text-secondary leading-relaxed text-sm">{strength.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-navy to-navy-dark text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            期待优秀的您加入全程创优
          </h2>
          <p className="text-white/70 mb-8">
            与我们一起，为工程建设事业贡献专业力量
          </p>
          <Link
            to={ROUTES.CONTACT}
            className="inline-flex items-center gap-2 rounded-lg bg-gold px-8 py-3.5 text-sm font-semibold text-navy transition-all hover:bg-gold-light"
          >
            联系我们
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
