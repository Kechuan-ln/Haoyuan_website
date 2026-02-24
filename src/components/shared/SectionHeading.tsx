interface SectionHeadingProps {
  title: string
  subtitle?: string
}

export function SectionHeading({ title, subtitle }: SectionHeadingProps) {
  return (
    <div className="text-center mb-12">
      <h2 className="text-3xl font-bold text-navy mb-3">{title}</h2>
      <div className="w-16 h-1 bg-gold mx-auto rounded-full" />
      {subtitle && <p className="text-gray-600 mt-4">{subtitle}</p>}
    </div>
  )
}
