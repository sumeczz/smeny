"use client"
import type { Period } from "@/lib/types"
import { CalendarRange } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { playClickSound } from "@/lib/sound-service"

interface PeriodSelectorProps {
  value: Period
  onChange: (value: Period) => void
}

export default function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  const periods: { value: Period; label: string }[] = [
    { value: "lastPayment", label: "Od poslední výplaty" },
    { value: "month", label: "Tento měsíc" },
    { value: "year", label: "Tento rok" },
    { value: "all", label: "Vše" },
  ]

  const handleChange = (val: string) => {
    playClickSound()
    onChange(val as Period)
  }

  return (
    <div className="mb-4 animate-fade-in">
      <Select value={value} onValueChange={handleChange}>
        <SelectTrigger className="w-full h-9 text-sm bg-background/50 border-input hover:border-primary transition-colors duration-200">
          <div className="flex items-center">
            <CalendarRange className="h-3.5 w-3.5 mr-1.5" />
            <SelectValue placeholder="Vyberte období" />
          </div>
        </SelectTrigger>
        <SelectContent className="animate-scale-in">
          {periods.map((period) => (
            <SelectItem key={period.value} value={period.value} className="text-sm">
              {period.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
