import { useParams } from 'react-router-dom'

export default function BidEvaluationPage() {
  const { id } = useParams()

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-navy mb-4">在线评审</h1>
        <p className="text-text-secondary">招标 {id} 的投标文件在线评审，正在建设中...</p>
      </div>
    </div>
  )
}
