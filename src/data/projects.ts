export interface ProjectItem {
  id: string
  title: string
  category: string
  scope: string
  location: string
}

export const PROJECTS_DATA: ProjectItem[] = [
  {
    id: '1',
    title: '深圳市宝安区福永人民医院消化内镜中心改造工程',
    category: 'medical',
    scope: '装饰装修、电气、智能化、给排水、暖通、消防',
    location: '深圳市宝安区',
  },
  {
    id: '2',
    title: '深圳市宝安区福永人民医院托育机构改造工程',
    category: 'medical',
    scope: '装饰装修、电气、智能化、给排水、暖通、消防',
    location: '深圳市宝安区',
  },
  {
    id: '3',
    title: '福永人民医院康之宝药库、设备仓库改造工程',
    category: 'medical',
    scope: '装饰装修、电气、智能化、给排水、暖通、消防',
    location: '深圳市宝安区',
  },
  {
    id: '4',
    title: '福永人民医院康之宝职工食堂改造工程',
    category: 'medical',
    scope: '装饰装修、电气、智能化、给排水、暖通、消防',
    location: '深圳市宝安区',
  },
  {
    id: '5',
    title: '华兴光伏发电项目工程',
    category: 'photovoltaic',
    scope: '钢结构、光伏发电',
    location: '深圳市',
  },
  {
    id: '6',
    title: '桃源街道大学城、峰景社区党群服务中心活动室改造',
    category: 'municipal',
    scope: '装饰装修、电气、智能化、给排水、暖通、消防',
    location: '深圳市南山区',
  },
  {
    id: '7',
    title: '深圳市新泰思德科技有限公司废气提标改造工程',
    category: 'industrial',
    scope: '废气净化、加药系统、噪音控制、电气、智能控制',
    location: '深圳市',
  },
  {
    id: '8',
    title: '大铲湾公司临时办公楼拆除工程',
    category: 'municipal',
    scope: '主体结构拆除、废弃物处置',
    location: '深圳市宝安区',
  },
  {
    id: '9',
    title: '中山大学深圳校区人才保障性住房安居澜庭装修工程',
    category: 'housing',
    scope: '室内装修工程',
    location: '深圳市光明区',
  },
  {
    id: '10',
    title: '中山大学深圳校区人才保障性住房安居萃云阁装修工程',
    category: 'housing',
    scope: '室内装修工程',
    location: '深圳市光明区',
  },
  {
    id: '11',
    title: '光明华夏中学实验室采购工程',
    category: 'education',
    scope: '实验室设备采购',
    location: '深圳市光明区',
  },
  {
    id: '12',
    title: '中国科学院深圳理工大学明珠校区项目',
    category: 'education',
    scope: '校区建设',
    location: '深圳市光明区',
  },
  {
    id: '13',
    title: '深圳先进电子材料国际创新研究院项目',
    category: 'industrial',
    scope: '研究院建设',
    location: '深圳市',
  },
]

export const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  medical: { bg: 'bg-red-100', text: 'text-red-700' },
  education: { bg: 'bg-blue-100', text: 'text-blue-700' },
  housing: { bg: 'bg-green-100', text: 'text-green-700' },
  industrial: { bg: 'bg-purple-100', text: 'text-purple-700' },
  photovoltaic: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  municipal: { bg: 'bg-teal/10', text: 'text-teal' },
}

export const CATEGORY_LABELS: Record<string, string> = {
  medical: '医疗',
  education: '教育',
  housing: '住房',
  industrial: '产业园',
  photovoltaic: '光伏',
  municipal: '市政',
}

export function getProjectById(id: string): ProjectItem | undefined {
  return PROJECTS_DATA.find((p) => p.id === id)
}

export function getProjectsByCategory(category: string): ProjectItem[] {
  return PROJECTS_DATA.filter((p) => p.category === category)
}
