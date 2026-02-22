import { useParams } from 'react-router-dom'

export default function ProjectDetailPage() {
  const { id } = useParams()

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-navy mb-4">业绩详情</h1>
        <p className="text-text-secondary">项目 {id} 详情页面，正在建设中...</p>
      </div>
    </div>
  )
}
