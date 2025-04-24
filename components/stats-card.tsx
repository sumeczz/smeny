import type { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
}

export default function StatsCard({ title, value, description, icon: Icon }: StatsCardProps) {
  return (
    <div className="stats-card">
      <div className="section-title text-muted-foreground">
        {Icon && <Icon className="h-4 w-4 mr-1.5" />}
        {title}
      </div>
      <div className="text-primary-value mt-1">{value}</div>
      {description && <p className="form-hint">{description}</p>}
    </div>
  )
}
