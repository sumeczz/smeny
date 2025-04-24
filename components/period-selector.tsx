"use client"
import type { Period } from "@/lib/types"
import { CalendarRange, HelpCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { playClickSound } from "@/lib/sound-service"
import { formatDateRange, getPeriodDateRange } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface PeriodSelectorProps {
  value: Period
  onChange: (value: Period) => void
}

export default function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  const periods: { value: Period; label: string }[] = [
    { value: "thisWeek", label: "Tento týden" },
    { value: "lastWeek", label: "Minulý týden" },
    { value: "lastPayment", label: "Od poslední výplaty" },
    { value: "month", label: "Tento měsíc" },
    { value: "year", label: "Tento rok" },
    { value: "all", label: "Vše" },
  ]

  const handleChange = (val: string) => {
    playClickSound()
    onChange(val as Period)
  }

  // Get date range for the selected period
  const dateRange = getPeriodDateRange(value)
  const dateRangeText = dateRange ? formatDateRange(dateRange.start, dateRange.end) : null

  return (
    <div className="mb-4 animate-fade-in">
      <div className="flex items-center">
        <Select value={value} onValueChange={handleChange}>
          <SelectTrigger className="w-full h-10 text-sm bg-background/50 border-input hover:border-primary transition-colors duration-200 rounded-lg">
            <div className="flex items-center">
              <CalendarRange className="h-4 w-4 mr-2" />
              <div className="flex flex-col items-start">
                <SelectValue placeholder="Vyberte období" />
                {dateRangeText && <span className="text-xs text-muted-foreground">{dateRangeText}</span>}
              </div>
            </div>
          </SelectTrigger>
          <SelectContent className="animate-scale-in rounded-lg">
            {periods.map((period) => (
              <SelectItem key={period.value} value={period.value} className="text-sm">
                {period.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="ml-2 text-muted-foreground hover:text-foreground transition-colors">
                <HelpCircle className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Vyberte časové období pro zobrazení statistik</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}
