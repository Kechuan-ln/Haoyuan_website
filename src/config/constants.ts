export const COMPANY = {
  name: '广东全程创优建设技术有限公司',
  shortName: '全程创优',
  slogan: '全程创优 共创未来',
  fullSlogan: '选择全程创优，共创光明未来',
  phone: '0755-XXXXXXXX',
  email: 'info@haoyuan.com',
  address: '深圳市光明区光明街道',
  foundedYear: 2021,
  values: ['专业', '共赢', '责任', '诚信'] as const,
  concepts: {
    threeNoWorries: ['质量零事故', '安全无隐患', '进度可视化'],
    threePromises: ['文明工地典范', '结构品质标杆', '绿色建筑先锋'],
  },
}

export const PROJECT_CATEGORIES = [
  { value: 'medical', label: '医疗' },
  { value: 'education', label: '教育' },
  { value: 'housing', label: '住房' },
  { value: 'industrial', label: '产业园' },
  { value: 'photovoltaic', label: '光伏' },
  { value: 'municipal', label: '市政' },
] as const

export const SERVICE_TYPES = [
  { value: 'cost', label: '工程造价', icon: 'Calculator' },
  { value: 'bidding-agent', label: '招标代理', icon: 'FileText' },
  { value: 'supervision', label: '工程监理', icon: 'Shield' },
  { value: 'management', label: '项目管理', icon: 'LayoutDashboard' },
  { value: 'consulting', label: '工程咨询', icon: 'MessageSquare' },
] as const

export const BID_STATUSES = [
  { value: 'draft', label: '草稿', color: 'gray' },
  { value: 'published', label: '已发布', color: 'blue' },
  { value: 'bidding', label: '投标中', color: 'green' },
  { value: 'closed', label: '已截止', color: 'yellow' },
  { value: 'evaluating', label: '评标中', color: 'orange' },
  { value: 'awarded', label: '已定标', color: 'navy' },
] as const

export const VENDOR_STATUSES = [
  { value: 'pending', label: '待审核', color: 'yellow' },
  { value: 'approved', label: '已通过', color: 'green' },
  { value: 'rejected', label: '已拒绝', color: 'red' },
] as const

export const ARTICLE_CATEGORIES = [
  { value: 'news', label: '新闻动态' },
  { value: 'announcement', label: '通知公告' },
  { value: 'industry', label: '行业资讯' },
  { value: 'company', label: '企业动态' },
] as const

export const USER_ROLES = [
  { value: 'vendor', label: '供应商' },
  { value: 'admin', label: '管理员' },
  { value: 'reviewer', label: '评审员' },
] as const

export const ADMIN_LEVELS = [
  { value: 'manager', label: '经理' },
  { value: 'worker', label: '员工' },
] as const
