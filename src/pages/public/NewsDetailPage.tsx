import { useParams, Link } from 'react-router-dom'
import { useMemo } from 'react'
import {
  Calendar,
  User,
  ArrowLeft,
  Share2,
  ImageIcon,
  ChevronRight,
} from 'lucide-react'
import type { ArticleCategory } from '@/types/article'
import { ROUTES } from '@/config/routes'

interface SampleArticle {
  id: string
  title: string
  category: ArticleCategory
  date: string
  excerpt: string
  content: string[]
}

const CATEGORY_BADGE_MAP: Record<ArticleCategory, { label: string; className: string }> = {
  news: { label: '新闻动态', className: 'bg-teal/10 text-teal' },
  announcement: { label: '通知公告', className: 'bg-gold/10 text-gold-dark' },
  industry: { label: '行业资讯', className: 'bg-navy/10 text-navy' },
  company: { label: '企业动态', className: 'bg-green-50 text-green-700' },
}

const SAMPLE_ARTICLES: SampleArticle[] = [
  {
    id: '1',
    title: '全程创优荣获AAAA级标准化工地认证',
    category: 'company',
    date: '2025-01-15',
    excerpt:
      '近日，我公司成功通过AAAA级标准化工地评审，标志着公司在工程管理标准化方面又迈上了新的台阶。',
    content: [
      '近日，我公司成功通过AAAA级标准化工地评审，标志着公司在工程管理标准化方面又迈上了新的台阶。此次评审由深圳市住房和建设局组织，经过严格的现场检查、资料审核和综合评定，我公司在安全管理、质量控制、文明施工和绿色建筑等方面均获得高分。',
      '在评审过程中，专家组对公司的施工现场管理给予了高度评价，特别是在BIM技术应用、智慧工地建设、扬尘治理和噪声控制等方面的创新做法，获得了评审专家的一致认可。我公司始终坚持"质量第一、安全为本"的管理理念，不断完善标准化管理体系，将精细化管理贯穿于工程建设的每一个环节。',
      '此次荣获AAAA级标准化工地认证，不仅是对公司过去工作的肯定，更是对未来发展的激励。公司将继续秉承"全程创优、共创未来"的企业理念，不断提升工程管理水平和技术创新能力，为客户提供更加优质的工程建设技术服务，为推动行业高质量发展贡献力量。',
    ],
  },
  {
    id: '2',
    title: '深圳市建设工程招标投标新规解读',
    category: 'industry',
    date: '2025-01-10',
    excerpt:
      '深圳市住建局近日发布了建设工程招标投标管理的最新规定，对招标流程、评标标准等方面进行了重要调整。',
    content: [
      '深圳市住建局近日发布了建设工程招标投标管理的最新规定，对招标流程、评标标准等方面进行了重要调整。新规从规范招标行为、优化评标办法、加强监管力度等多个维度，提出了一系列改革措施。',
      '新规明确提出，将进一步推进电子招标投标制度改革，实现全流程在线办理，减少人为干预。同时，评标办法也将进行优化调整，更加注重企业的技术能力、项目经验和信用评价，引导行业从价格竞争向质量竞争转变。此外，新规还强化了对围标串标、弄虚作假等违法违规行为的处罚力度。',
      '作为专业的工程建设技术服务企业，我公司一直密切关注行业政策动态，及时调整服务策略。我们将持续为客户提供合规、高效的招标代理服务，帮助客户在新的政策环境下实现项目目标。建议相关企业认真学习新规内容，确保招标投标活动依法合规进行。',
    ],
  },
  {
    id: '3',
    title: '福永人民医院改造项目顺利竣工验收',
    category: 'news',
    date: '2024-12-20',
    excerpt:
      '由我公司承担监理服务的福永人民医院消化内镜中心改造工程顺利通过竣工验收，获得业主高度评价。',
    content: [
      '由我公司承担监理服务的福永人民医院消化内镜中心改造工程顺利通过竣工验收，获得业主高度评价。该项目位于深圳市宝安区，总建筑面积约2000平方米，涵盖装饰装修、机电安装、医疗净化等多个专业工程。',
      '项目实施过程中，我公司监理团队严格按照国家和行业标准，对施工质量、安全文明、进度控制等方面进行了全面的监督管理。特别是在医疗净化工程方面，团队制定了详细的质量控制方案，对洁净度、温湿度、压差等关键指标进行了严格的检测和验收，确保了工程质量满足医疗使用要求。',
      '竣工验收会上，由建设单位、设计单位、施工单位和监理单位组成的验收组对工程进行了全面检查，一致认为工程质量合格，符合设计要求和相关标准规范。业主单位对我公司的监理服务表示高度认可，认为监理团队专业敬业、管理规范、服务到位，为项目的顺利完成提供了有力保障。',
    ],
  },
  {
    id: '4',
    title: '公司通过ISO三体系年度监督审核',
    category: 'company',
    date: '2024-12-05',
    excerpt:
      '我公司顺利通过ISO 9001、ISO 14001、ISO 45001三大管理体系年度监督审核，持续保持认证有效性。',
    content: [
      '我公司顺利通过ISO 9001、ISO 14001、ISO 45001三大管理体系年度监督审核，持续保持认证有效性。审核组对公司的质量管理体系、环境管理体系和职业健康安全管理体系进行了全面、深入的审查。',
      '审核组通过文件审查、现场检查、人员访谈等方式，对公司的管理流程、操作规范、记录档案等进行了详细审核。审核结果表明，公司三大管理体系运行有效，文件体系完善，过程控制规范，各项指标均满足标准要求，未发现严重不符合项。',
      '通过此次监督审核，进一步证明了我公司在管理体系建设方面的成熟度和规范性。公司将以此为契机，持续改进管理体系，不断提升管理效能，为客户提供更加优质、高效的工程建设技术服务。我们坚信，只有建立健全的管理体系，才能确保服务质量的稳定和持续提升。',
    ],
  },
  {
    id: '5',
    title: '关于开展2025年度供应商入库申请的通知',
    category: 'announcement',
    date: '2024-11-28',
    excerpt:
      '为进一步规范公司供应商管理，现开展2025年度合格供应商入库申请工作，欢迎符合条件的企业报名。',
    content: [
      '为进一步规范公司供应商管理，现开展2025年度合格供应商入库申请工作，欢迎符合条件的企业报名。本次入库申请面向材料供应商、设备供应商、专业分包商等各类合作伙伴。',
      '申请条件包括：具有独立法人资格，持有有效的营业执照；具有良好的商业信誉和健全的财务制度；具备相应的技术力量和生产能力；近三年无重大违法违规记录；具有良好的履约能力和售后服务能力。符合条件的企业可通过公司官网下载入库申请表，填写完整后连同相关资质证明材料提交至公司采购管理部门。',
      '公司将对申请材料进行审核评估，审核通过的企业将纳入公司合格供应商名录。入库后的供应商将优先获得项目合作机会。申请截止日期为2025年1月31日，逾期不再受理。如有疑问，请拨打公司联系电话咨询。',
    ],
  },
  {
    id: '6',
    title: '光伏发电项目绿色施工技术应用',
    category: 'industry',
    date: '2024-11-15',
    excerpt:
      '随着双碳目标的推进，光伏发电项目在建设领域的应用日益广泛。本文探讨了光伏项目施工中的绿色技术应用。',
    content: [
      '随着双碳目标的推进，光伏发电项目在建设领域的应用日益广泛。本文探讨了光伏项目施工中的绿色技术应用，包括施工过程中的节能降碳措施、环境保护技术以及资源循环利用方案。',
      '在光伏发电项目施工中，绿色施工技术的应用主要体现在以下几个方面：一是采用装配式施工工艺，减少现场湿作业，降低建筑垃圾产生量；二是应用智能化监测系统，实时监控施工过程中的能耗、扬尘和噪声指标；三是推广使用新能源施工设备，减少化石燃料消耗；四是实施雨水收集和污水处理回用系统，节约水资源。',
      '我公司在光伏发电项目监理和管理服务中，积极推广绿色施工技术，将绿色发展理念融入项目管理全过程。通过制定专项绿色施工方案、开展施工人员培训、建立绿色施工考核机制等措施，有效推动了项目的绿色建造。未来，我们将继续探索更多绿色施工新技术、新工艺，为建设行业的可持续发展贡献力量。',
    ],
  },
]

function formatDisplayDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-')
  return `${year}年${month}月${day}日`
}

export default function NewsDetailPage() {
  const { id } = useParams()

  const article = useMemo(
    () => SAMPLE_ARTICLES.find((a) => a.id === id),
    [id],
  )

  const relatedArticles = useMemo(() => {
    if (!article) return []
    return SAMPLE_ARTICLES.filter(
      (a) => a.category === article.category && a.id !== article.id,
    ).slice(0, 3)
  }, [article])

  if (!article) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-navy mb-4">文章未找到</h1>
          <p className="text-text-secondary mb-6">您访问的文章不存在或已被删除</p>
          <Link
            to={ROUTES.NEWS}
            className="inline-flex items-center gap-2 text-teal hover:text-teal-dark transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            返回新闻列表
          </Link>
        </div>
      </div>
    )
  }

  const badge = CATEGORY_BADGE_MAP[article.category]

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
            <Link to={ROUTES.NEWS} className="hover:text-navy transition-colors">
              新闻动态
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-text-primary line-clamp-1">{article.title}</span>
          </nav>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-12 sm:py-16 px-4 bg-bg-gray">
        <div className="max-w-4xl mx-auto">
          <article className="bg-white rounded-xl shadow-md border border-border overflow-hidden">
            {/* Cover Image Placeholder */}
            <div className="h-64 sm:h-80 bg-gradient-to-br from-navy/5 to-navy/10 flex items-center justify-center">
              <ImageIcon className="w-16 h-16 text-navy/15" />
            </div>

            <div className="p-6 sm:p-10">
              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-5 leading-tight">
                {article.title}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 mb-8 pb-6 border-b border-border">
                <span className="flex items-center gap-1.5 text-sm text-text-secondary">
                  <User className="w-4 h-4" />
                  全程创优
                </span>
                <span className="flex items-center gap-1.5 text-sm text-text-secondary">
                  <Calendar className="w-4 h-4" />
                  {formatDisplayDate(article.date)}
                </span>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${badge.className}`}
                >
                  {badge.label}
                </span>
              </div>

              {/* Article Body */}
              <div className="prose max-w-none">
                {article.content.map((paragraph, idx) => (
                  <p
                    key={idx}
                    className="text-text-secondary leading-loose mb-6 text-[15px]"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Share Section */}
              <div className="mt-10 pt-6 border-t border-border flex items-center gap-3">
                <Share2 className="w-4 h-4 text-text-muted" />
                <span className="text-sm text-text-muted">分享到：</span>
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 bg-bg-gray rounded-full flex items-center justify-center text-xs text-text-muted cursor-pointer hover:bg-navy/10 transition-colors">
                    微
                  </span>
                  <span className="w-8 h-8 bg-bg-gray rounded-full flex items-center justify-center text-xs text-text-muted cursor-pointer hover:bg-navy/10 transition-colors">
                    博
                  </span>
                  <span className="w-8 h-8 bg-bg-gray rounded-full flex items-center justify-center text-xs text-text-muted cursor-pointer hover:bg-navy/10 transition-colors">
                    QQ
                  </span>
                </div>
              </div>
            </div>
          </article>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div className="mt-10">
              <h2 className="text-xl font-bold text-navy mb-6">相关文章</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {relatedArticles.map((related) => {
                  const relatedBadge = CATEGORY_BADGE_MAP[related.category]
                  return (
                    <Link
                      key={related.id}
                      to={`/news/${related.id}`}
                      className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-border"
                    >
                      <div className="h-36 bg-gradient-to-br from-navy/5 to-navy/10 flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-navy/15" />
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${relatedBadge.className}`}
                          >
                            {relatedBadge.label}
                          </span>
                          <span className="text-xs text-text-muted">
                            {formatDisplayDate(related.date)}
                          </span>
                        </div>
                        <h3 className="font-bold text-text-primary text-sm group-hover:text-navy transition-colors line-clamp-2">
                          {related.title}
                        </h3>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* Back to List */}
          <div className="mt-8 text-center">
            <Link
              to={ROUTES.NEWS}
              className="inline-flex items-center gap-2 text-teal hover:text-teal-dark transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              返回新闻列表
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
