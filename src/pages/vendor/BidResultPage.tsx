import { useParams } from 'react-router-dom'

export default function BidResultPage() {
  const { id } = useParams()

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-teal mb-4">中标结果</h1>
        <p className="text-text-secondary">招标 {id} 的中标结果公示，正在建设中...</p>
      </div>
    </div>
  )
}
