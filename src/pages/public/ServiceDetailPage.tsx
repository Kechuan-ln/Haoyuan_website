import { useParams } from 'react-router-dom'

export default function ServiceDetailPage() {
  const { id } = useParams()

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-navy mb-4">业务详情</h1>
        <p className="text-text-secondary">业务 {id} 详情页面，正在建设中...</p>
      </div>
    </div>
  )
}
