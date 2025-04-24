"use client"

import { useState, useEffect } from "react"
import ShiftItem from "@/components/shift-item"
import EmptyState from "@/components/empty-state"
import { getShifts, getWeekStartDay } from "@/lib/shift-service"
import type { Shift } from "@/lib/types"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { playClickSound } from "@/lib/sound-service"
import CurrentDateTime from "@/components/current-date-time"
import { isNewWeek } from "@/lib/utils"
import { autoBackup, isUserLoggedIn } from "@/lib/backup-service"

export default function HomePage() {
  const [shifts, setShifts] = useState<Shift[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [weekStartDay, setWeekStartDay] = useState<number>(1)

  useEffect(() => {
    setShifts(getShifts())
    setWeekStartDay(getWeekStartDay())
    setIsLoading(false)

    // Kontrola automatického zálohování při načtení hlavní stránky
    const checkAutoBackup = async () => {
      const autoBackupEnabled = localStorage.getItem("autoBackupEnabled") === "true"
      if (autoBackupEnabled && isUserLoggedIn()) {
        await autoBackup()
      }
    }

    checkAutoBackup()
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
    <div className="page-transition">
      <div className="header">
        <CurrentDateTime />
        <Link href="/add" className="ml-auto" aria-label="Přidat směnu" onClick={() => playClickSound()}>
          <Button size="icon" variant="ghost" className="icon-button text-primary">
            <PlusCircle className="h-5 w-5" />
          </Button>
        </Link>
      </div>

      <div className="page-container">
        {shifts.length === 0 ? (
          <EmptyState
            title="Žádné směny"
            description="Zatím jste nezaznamenali žádné směny."
            actionLabel="Přidat směnu"
            actionHref="/add"
          />
        ) : (
          <div className="space-y-1 animate-slide-up">
            {sortedShifts.map((shift, index) => {
              // Check if this shift starts a new week compared to the previous one
              const previousShift = index < sortedShifts.length - 1 ? sortedShifts[index + 1] : null
              const isNewWeekStart = previousShift ? isNewWeek(shift.date, previousShift.date, weekStartDay) : false

              return (
                <ShiftItem
                  key={shift.id}
                  shift={shift}
                  onDelete={handleDelete}
                  allShifts={shifts}
                  index={index}
                  isNewWeek={isNewWeekStart}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
