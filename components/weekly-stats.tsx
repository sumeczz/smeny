"use client"

import { useState } from "react"
import type { Shift } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { BarChart, ChevronDown, ChevronUp } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { playClickSound } from "@/lib/sound-service"

interface WeeklyStatsProps {
  shifts: Shift[]
  hourlyRate: number
}

export default function WeeklyStats({ shifts, hourlyRate }: WeeklyStatsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleToggle = () => {
    playClickSound()
    setIsExpanded(!isExpanded)
  }

  // Group shifts by day of week
  const dayStats = calculateDayStats(shifts, hourlyRate)

  // Find the day with most hours
  const maxHours = Math.max(...Object.values(dayStats).map((day) => day.hours))

  return (
    <div className="stats-card mb-4">
      <button onClick={handleToggle} className="w-full flex items-center justify-between p-2">
        <div className="flex items-center">
          <BarChart className="h-4 w-4 mr-2 text-primary" />
          <span className="text-sm font-medium">Statistika podle dnů</span>
        </div>
        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-2 animate-slide-down">
          {Object.entries(dayStats).map(([day, stats]) => (
            <TooltipProvider key={day}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-col space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">{day}</span>
                      <span>{stats.hours.toFixed(1)} h</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${(stats.hours / maxHours) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-xs">
                    <p>Celkem: {formatCurrency(stats.earnings)}</p>
                    <p>Počet směn: {stats.count}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      )}
    </div>
  )
}

function calculateDayStats(shifts: Shift[], hourlyRate: number) {
  const days = {
    Pondělí: { hours: 0, count: 0, earnings: 0 },
    Úterý: { hours: 0, count: 0, earnings: 0 },
    Středa: { hours: 0, count: 0, earnings: 0 },
    Čtvrtek: { hours: 0, count: 0, earnings: 0 },
    Pátek: { hours: 0, count: 0, earnings: 0 },
    Sobota: { hours: 0, count: 0, earnings: 0 },
    Neděle: { hours: 0, count: 0, earnings: 0 },
  }

  const dayNames = ["Neděle", "Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek", "Sobota"]

  // Only include regular shifts, not advances
  const regularShifts = shifts.filter((shift) => !shift.isAdvance)

  regularShifts.forEach((shift) => {
    const date = new Date(shift.date)
    const dayName = dayNames[date.getDay()]

    days[dayName].hours += shift.hours
    days[dayName].count += 1
    days[dayName].earnings += shift.hours * hourlyRate
  })

  return days
}
