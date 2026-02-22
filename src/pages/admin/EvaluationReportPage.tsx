import { useParams } from 'react-router-dom'

export default function EvaluationReportPage() {
  const { id } = useParams()

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-navy mb-4">评标报告</h1>
        <p className="text-text-secondary">招标 {id} 的评标报告详情，正在建设中...</p>
      </div>
    </div>
  )
}
