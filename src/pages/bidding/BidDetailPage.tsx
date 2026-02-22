import { useParams, Link } from 'react-router-dom'
import { useMemo } from 'react'
import {
  Calendar,
  ArrowLeft,
  FileText,
  Download,
  ChevronRight,
  Hash,
  DollarSign,
  Clock,
  FolderOpen,
  Gavel,
  Tag,
} from 'lucide-react'
import type { BidStatus } from '@/types/bid'
import { ROUTES } from '@/config/routes'

interface SampleBid {
  id: string
  title: string
  bidNumber: string
  status: BidStatus
  category: string
  budget: string
  deadline: string
  openingDate: string
  requirements: string[]
  description: string
}

const STATUS_BADGE_MAP: Record<string, { label: string; className: string }> = {
  bidding: { label: '投标中', className: 'bg-green-50 text-green-700' },
  closed: { label: '已截止', className: 'bg-yellow-50 text-yellow-700' },
  awarded: { label: '已定标', className: 'bg-navy/10 text-navy' },
}

const CATEGORY_COLOR_MAP: Record<string, string> = {
  '医疗': 'bg-teal/10 text-teal',
  '教育': 'bg-blue-50 text-blue-700',
  '产业园': 'bg-purple-50 text-purple-700',
  '市政': 'bg-orange-50 text-orange-700',
}

const SAMPLE_BIDS: SampleBid[] = [
  {
    id: '1',
    title: '福永人民医院康复科室改造工程监理',
    bidNumber: 'QCCY-2025-001',
    status: 'bidding',
    category: '医疗',
    budget: '50万元',
    deadline: '2025-03-15',
    openingDate: '2025-03-18',
    description:
      '本项目为深圳市宝安区福永人民医院康复科室改造工程，涵盖装饰装修、机电安装、医疗设备安装及配套工程。项目总建筑面积约1500平方米，改造内容包括科室功能布局调整、医疗净化系统升级、智能化设备集成等。现面向具备相应资质的工程监理企业公开招标，征集监理服务提供商。',
    requirements: [
      '具有建设行政主管部门颁发的工程监理综合资质或房屋建筑工程监理甲级资质',
      '具有独立法人资格，持有有效的营业执照',
      '近三年具有类似医疗建筑监理业绩不少于2项',
      '拟派总监理工程师应具有国家注册监理工程师资格证书，并具有类似项目经验',
      '企业信用评价良好，近三年无重大质量安全事故',
      '具有完善的质量管理体系和安全管理体系',
    ],
  },
  {
    id: '2',
    title: '光明区某学校实验室设备采购',
    bidNumber: 'QCCY-2025-002',
    status: 'bidding',
    category: '教育',
    budget: '120万元',
    deadline: '2025-03-20',
    openingDate: '2025-03-25',
    description:
      '本项目为光明区某学校实验室设备采购项目，采购内容包括物理实验室、化学实验室、生物实验室的教学设备、实验器材及配套设施。要求设备质量符合国家相关标准，并提供安装调试及培训服务。项目预算为120万元人民币，现面向合格供应商公开招标。',
    requirements: [
      '具有独立法人资格，持有有效的营业执照',
      '具有教学设备供应相关经营范围',
      '近三年具有类似学校实验室设备供应业绩不少于3项',
      '所供设备须符合国家相关质量标准和环保要求',
      '具有完善的售后服务体系，能提供不少于2年的质保服务',
      '在深圳市或珠三角地区设有售后服务网点',
    ],
  },
  {
    id: '3',
    title: '某产业园区装修工程造价咨询',
    bidNumber: 'QCCY-2024-018',
    status: 'closed',
    category: '产业园',
    budget: '30万元',
    deadline: '2025-01-15',
    openingDate: '2025-01-20',
    description:
      '本项目为某产业园区装修工程的造价咨询服务，服务内容包括编制工程量清单、投标控制价编制、工程结算审核等全过程造价咨询服务。项目装修面积约8000平方米，涵盖办公区域、公共空间及配套设施。',
    requirements: [
      '具有工程造价咨询甲级资质',
      '具有独立法人资格，持有有效的营业执照',
      '近三年具有类似产业园区项目造价咨询业绩不少于2项',
      '拟派项目负责人应具有造价工程师资格证书',
      '企业信用评价良好，近三年无不良行为记录',
    ],
  },
  {
    id: '4',
    title: '南山区社区服务中心改造项目管理',
    bidNumber: 'QCCY-2024-015',
    status: 'awarded',
    category: '市政',
    budget: '80万元',
    deadline: '2024-12-01',
    openingDate: '2024-12-05',
    description:
      '本项目为南山区社区服务中心改造的全过程项目管理服务，服务内容涵盖项目前期策划、设计管理、招标管理、施工管理及竣工验收等全过程。改造面积约3000平方米，旨在提升社区服务功能和群众服务体验。',
    requirements: [
      '具有工程项目管理相关资质',
      '具有独立法人资格，持有有效的营业执照',
      '近三年具有类似市政或公共建筑项目管理业绩不少于3项',
      '拟派项目经理应具有高级工程师职称和丰富的项目管理经验',
      '具有完善的项目管理流程和信息化管理能力',
    ],
  },
]

function formatDisplayDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-')
  return `${year}年${month}月${day}日`
}

export default function BidDetailPage() {
  const { id } = useParams()

  const bid = useMemo(
    () => SAMPLE_BIDS.find((b) => b.id === id),
    [id],
  )

  if (!bid) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-navy mb-4">招标项目未找到</h1>
          <p className="text-text-secondary mb-6">您访问的招标项目不存在或已被删除</p>
          <Link
            to={ROUTES.BIDDING}
            className="inline-flex items-center gap-2 text-teal hover:text-teal-dark transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            返回招标大厅
          </Link>
        </div>
      </div>
    )
  }

  const statusBadge = STATUS_BADGE_MAP[bid.status] ?? {
    label: bid.status,
    className: 'bg-gray-100 text-gray-600',
  }
  const categoryColor = CATEGORY_COLOR_MAP[bid.category] ?? 'bg-gray-100 text-gray-600'
  const isBidding = bid.status === 'bidding'

  const infoItems = [
    { icon: FolderOpen, label: '项目类别', value: bid.category },
    { icon: DollarSign, label: '预算金额', value: bid.budget },
    { icon: Calendar, label: '报名截止时间', value: formatDisplayDate(bid.deadline) },
    { icon: Clock, label: '开标时间', value: formatDisplayDate(bid.openingDate) },
  ]

  return (
    <div>
      {/* Breadcrumb */}
      <section className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-text-muted">
            <Link to={ROUTES.HOME} className="hover:text-navy transition-colors">
              首页
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to={ROUTES.BIDDING} className="hover:text-navy transition-colors">
              招标大厅
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-text-primary line-clamp-1">{bid.title}</span>
          </nav>
        </div>
      </section>

      {/* Bid Detail */}
      <section className="py-12 sm:py-16 px-4 bg-bg-gray">
        <div className="max-w-4xl mx-auto">
          {/* Header Card */}
          <div className="bg-white rounded-xl shadow-md border border-border p-6 sm:p-8 mb-6">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span
                className={`text-xs font-medium px-3 py-1 rounded-full ${statusBadge.className}`}
              >
                {statusBadge.label}
              </span>
              <span
                className={`text-xs font-medium px-3 py-1 rounded-full ${categoryColor}`}
              >
                {bid.category}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-3">
              {bid.title}
            </h1>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Hash className="w-4 h-4 text-text-muted" />
              编号：{bid.bidNumber}
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            {infoItems.map((item) => (
              <div
                key={item.label}
                className="bg-white rounded-xl shadow-md border border-border p-5 flex items-center gap-4"
              >
                <div className="w-11 h-11 bg-navy/10 rounded-lg flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-navy" />
                </div>
                <div>
                  <p className="text-xs text-text-muted mb-0.5">{item.label}</p>
                  <p className="font-semibold text-text-primary">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl shadow-md border border-border p-6 sm:p-8 mb-6">
            <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
              <Gavel className="w-5 h-5" />
              项目概述
            </h2>
            <p className="text-text-secondary leading-loose text-[15px]">
              {bid.description}
            </p>
          </div>

          {/* Requirements */}
          <div className="bg-white rounded-xl shadow-md border border-border p-6 sm:p-8 mb-6">
            <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5" />
              招标要求
            </h2>
            <ul className="space-y-3">
              {bid.requirements.map((req, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-navy/10 rounded-full flex items-center justify-center text-xs font-medium text-navy shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-text-secondary text-[15px] leading-relaxed">
                    {req}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-xl shadow-md border border-border p-6 sm:p-8 mb-6">
            <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              招标文件
            </h2>
            <div className="flex items-center justify-between bg-bg-gray rounded-lg p-4 border border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="font-medium text-text-primary text-sm">招标文件.pdf</p>
                  <p className="text-xs text-text-muted">PDF 文件</p>
                </div>
              </div>
              <button
                disabled={!isBidding}
                className={`inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
                  isBidding
                    ? 'text-teal hover:bg-teal/10 cursor-pointer'
                    : 'text-text-muted cursor-not-allowed'
                }`}
              >
                <Download className="w-4 h-4" />
                下载
              </button>
            </div>
          </div>

          {/* Action Button */}
          <div className="text-center space-y-4">
            {isBidding ? (
              <Link
                to={ROUTES.LOGIN}
                className="inline-flex items-center gap-2 rounded-lg bg-gold px-10 py-3.5 text-sm font-semibold text-navy transition-all hover:bg-gold-light hover:shadow-lg hover:shadow-gold/20"
              >
                我要投标
              </Link>
            ) : (
              <button
                disabled
                className="inline-flex items-center gap-2 rounded-lg bg-gray-200 px-10 py-3.5 text-sm font-semibold text-text-muted cursor-not-allowed"
              >
                投标已截止
              </button>
            )}
          </div>

          {/* Back to List */}
          <div className="mt-8 text-center">
            <Link
              to={ROUTES.BIDDING}
              className="inline-flex items-center gap-2 text-teal hover:text-teal-dark transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              返回招标大厅
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
