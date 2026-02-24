interface EmptyStateProps {
  title: string
  description: string
  icon?: string
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="text-6xl mb-4">{icon ?? '📭'}</div>
      <h3 className="text-xl font-semibold text-navy mb-2">{title}</h3>
      <p className="text-text-muted">{description}</p>
    </div>
  )
}
