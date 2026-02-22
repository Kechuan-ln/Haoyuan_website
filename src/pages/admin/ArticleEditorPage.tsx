import { useParams } from 'react-router-dom'

export default function ArticleEditorPage() {
  const { id } = useParams()

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-navy mb-4">
          {id ? '编辑文章' : '新建文章'}
        </h1>
        <p className="text-text-secondary">富文本文章编辑器，正在建设中...</p>
      </div>
    </div>
  )
}
