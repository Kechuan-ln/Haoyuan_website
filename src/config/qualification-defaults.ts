import type { Qualification } from '@/types/qualification'

export const DEFAULT_QUALIFICATIONS: Omit<Qualification, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { title: '营业执照', issuer: '深圳市市场监督管理局', description: '广东全程创优建设技术有限公司，依法注册经营工程建设技术服务', iconName: 'FileCheck', colorTheme: 'navy', sortOrder: 0, isPublished: true },
  { title: '工程监理乙级资质', issuer: '住房和城乡建设部', description: '具备工程监理乙级资质，可承担相应规模的工程监理业务', iconName: 'Shield', colorTheme: 'teal', sortOrder: 1, isPublished: true },
  { title: 'ISO 9001 质量管理体系认证', issuer: '国际标准化组织认证', description: '建立完善的质量管理体系，确保服务品质持续稳定提升', iconName: 'BadgeCheck', colorTheme: 'navy', sortOrder: 2, isPublished: true },
  { title: 'ISO 14001 环境管理体系认证', issuer: '国际标准化组织认证', description: '践行绿色环保理念，规范环境管理，减少施工环境影响', iconName: 'Leaf', colorTheme: 'teal', sortOrder: 3, isPublished: true },
  { title: 'ISO 45001 职业健康安全管理体系认证', issuer: '国际标准化组织认证', description: '保障员工职业健康与安全，建立完善的安全管理制度', iconName: 'HardHat', colorTheme: 'gold', sortOrder: 4, isPublished: true },
  { title: 'AAAA 级标准化工地认证', issuer: '行业协会认证', description: '施工现场标准化管理达到AAAA级标准，彰显文明施工水平', iconName: 'Star', colorTheme: 'gold', sortOrder: 5, isPublished: true },
  { title: '售后服务认证', issuer: '国家认证认可监督管理委员会', description: '完善的售后服务体系，为客户提供持续的技术支持与服务保障', iconName: 'Heart', colorTheme: 'teal', sortOrder: 6, isPublished: true },
  { title: 'AAA 级信用等级证书', issuer: '信用评级机构', description: '企业信用等级达到AAA级最高标准，诚信经营获得权威认可', iconName: 'Award', colorTheme: 'navy', sortOrder: 7, isPublished: true },
]
