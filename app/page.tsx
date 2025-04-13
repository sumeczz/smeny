"use client"

import { useState, useEffect } from "react"
import ShiftItem from "@/components/shift-item"
import EmptyState from "@/components/empty-state"
import { getShifts } from "@/lib/shift-service"
import type { Shift } from "@/lib/types"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { playClickSound } from "@/lib/sound-service"
import CurrentDateTime from "@/components/current-date-time"

export default function HomePage() {
  const [shifts, setShifts] = useState<Shift[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setShifts(getShifts())
    setIsLoading(false)
  }, [])

  const handleDelete = () => {
    setShifts(getShifts())
  }

  // Sort shifts by date (newest first)
  const sortedShifts = [...shifts].sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return dateB - dateA
  })

  if (isLoading) {
    return <div className="p-4">Načítání...</div>
  }

  return (
    <div>
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border p-2 flex items-center justify-between transition-colors duration-300">
        <CurrentDateTime />
        <Link href="/add" className="ml-1" aria-label="Přidat směnu" onClick={() => playClickSound()}>
          <Button size="icon" variant="ghost" className="h-8 w-8 transition-colors duration-200">
            <PlusCircle className="h-5 w-5 text-primary" />
          </Button>
        </Link>
      </div>

      <div className="p-2">
        {shifts.length === 0 ? (
          <EmptyState
            title="Žádné směny"
            description="Zatím jste nezaznamenali žádné směny."
            actionLabel="Přidat směnu"
            actionHref="/add"
          />
        ) : (
          <div className="space-y-1.5">
            {sortedShifts.map((shift, index) => (
              <ShiftItem key={shift.id} shift={shift} onDelete={handleDelete} allShifts={shifts} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
