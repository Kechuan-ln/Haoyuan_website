import type { ContentStatus } from '@/types/content-status'

const STATUS_CONFIG: Record<ContentStatus, { label: string; className: string }> = {
  draft: { label: '草稿', className: 'bg-gray-100 text-gray-700' },
  pending_review: { label: '待审核', className: 'bg-yellow-100 text-yellow-700' },
  published: { label: '已发布', className: 'bg-green-100 text-green-700' },
  rejected: { label: '已退回', className: 'bg-red-100 text-red-700' },
}

interface ContentStatusBadgeProps {
  status: ContentStatus
}

export default function ContentStatusBadge({ status }: ContentStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}
