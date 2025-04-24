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
    <div className="flex flex-col items-center justify-center p-6 text-center h-[60vh] animate-fade-in">
      <div className="rounded-full bg-secondary p-3 mb-4 transition-colors duration-300">
        <Calendar className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="h2 mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6">{description}</p>
      {actionLabel && actionHref && (
        <Button asChild className="btn-primary h-10 px-4" onClick={() => playClickSound()}>
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  )
}
