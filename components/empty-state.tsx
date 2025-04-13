"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"
import Link from "next/link"
import { playClickSound } from "@/lib/sound-service"

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
}

export default function EmptyState({ title, description, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center h-[50vh]">
      <div className="rounded-full bg-secondary p-3 mb-3 transition-colors duration-300">
        <Calendar className="h-5 w-5 text-muted-foreground" />
      </div>
      <h3 className="text-base font-medium mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      {actionLabel && actionHref && (
        <Button asChild size="sm" className="h-9 text-sm btn-primary" onClick={() => playClickSound()}>
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  )
}
