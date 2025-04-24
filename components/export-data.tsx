"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, ChevronDown, ChevronUp } from "lucide-react"
import { playClickSound } from "@/lib/sound-service"
import type { Shift } from "@/lib/types"
import { formatDate } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ExportDataProps {
  shifts: Shift[]
  hourlyRate: number
  period?: string
}

export default function ExportData({ shifts, hourlyRate, period = "vse" }: ExportDataProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleToggle = () => {
    playClickSound()
    setIsExpanded(!isExpanded)
  }

  const exportToCSV = () => {
    playClickSound()

    // Create CSV content
    const headers = ["Datum", "Den", "Od", "Do", "Hodiny", "Záloha", "Výdělek", "Poznámka"]
    const rows = shifts.map((shift) => {
      const date = formatDate(shift.date)
      const day = new Date(shift.date).toLocaleDateString("cs-CZ", { weekday: "long" })
      const earnings = shift.isAdvance ? 0 : shift.hours * hourlyRate
      const advance = shift.advance || 0

      return [date, day, shift.startTime, shift.endTime, shift.hours.toFixed(1), advance, earnings, shift.notes || ""]
    })

    // Add summary row
    const totalHours = shifts.reduce((sum, shift) => sum + (shift.isAdvance ? 0 : shift.hours), 0)
    const totalAdvance = shifts.reduce((sum, shift) => sum + (shift.advance || 0), 0)
    const totalEarnings = totalHours * hourlyRate - totalAdvance

    rows.push(["CELKEM", "", "", "", totalHours.toFixed(1), totalAdvance, totalEarnings, ""])

    // Convert to CSV string
    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `smeny-${period}-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="stats-card mb-4">
      <button onClick={handleToggle} className="w-full flex items-center justify-between p-2">
        <div className="flex items-center">
          <Download className="h-4 w-4 mr-2 text-primary" />
          <span className="text-sm font-medium">Export dat</span>
        </div>
        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-3 animate-slide-down p-2">
          <p className="text-xs text-muted-foreground">
            Exportujte data o směnách do CSV souboru pro další zpracování.
          </p>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={exportToCSV} variant="outline" size="sm" className="w-full h-9">
                  <Download className="h-3.5 w-3.5 mr-2" />
                  Stáhnout CSV
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Stáhnout data ve formátu CSV</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </div>
  )
}
