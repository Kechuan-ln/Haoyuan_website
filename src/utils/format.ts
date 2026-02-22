import type { Timestamp } from 'firebase/firestore'

export function formatDate(timestamp: Timestamp): string {
  const date = timestamp.toDate()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}年${month}月${day}日`
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
