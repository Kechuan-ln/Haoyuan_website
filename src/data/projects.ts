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
