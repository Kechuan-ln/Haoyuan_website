function toDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null
  if (value instanceof Date) return value
  const parsed = new Date(value)
  return isNaN(parsed.getTime()) ? null : parsed
}

export function formatDate(value: Date | string | null | undefined): string {
  const date = toDate(value)
  if (!date) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}年${month}月${day}日`
}

export function formatRelativeTime(value: Date | string | null | undefined): string {
  const date = toDate(value)
  if (!date) return ''
  const now = Date.now()
  const then = date.getTime()
  const diffMs = now - then
  const diffMin = Math.floor(diffMs / 60000)
  const diffHour = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)
  if (diffMin < 1) return '刚刚'
  if (diffMin < 60) return `${diffMin}分钟前`
  if (diffHour < 24) return `${diffHour}小时前`
  if (diffDay < 30) return `${diffDay}天前`
  if (diffDay < 365) return `${Math.floor(diffDay / 30)}个月前`
  return `${Math.floor(diffDay / 365)}年前`
}

export function formatCurrency(amount: number): string {
  return `¥${amount.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
  }
  if (digits.length >= 10 && digits.startsWith('0')) {
    const areaLen = digits.startsWith('01') || digits.startsWith('02') ? 3 : 4
    return `${digits.slice(0, areaLen)}-${digits.slice(areaLen)}`
  }
  return phone
}
