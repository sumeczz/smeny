"use client"

import { useState, useEffect } from "react"
import Header from "@/components/header"
import PeriodSelector from "@/components/period-selector"
import StatsCard from "@/components/stats-card"
import PaymentAdjustment from "@/components/payment-adjustment"
import WeeklyStats from "@/components/weekly-stats"
// Odstraňte import komponenty ExportData
// import ExportData from "@/components/export-data"
import { getShifts, getHourlyRate, getPaymentDay } from "@/lib/shift-service"
import type { Shift, Period, ShiftStats } from "@/lib/types"
import { filterShiftsByPeriod, calculateStats, formatCurrency } from "@/lib/utils"
import { Clock, BanknoteIcon, Wallet, HelpCircle } from "lucide-react"
import { playClickSound } from "@/lib/sound-service"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function StatsPage() {
  const [shifts, setShifts] = useState<Shift[]>([])
  const [period, setPeriod] = useState<Period>("thisWeek")
  const [hourlyRate, setHourlyRate] = useState<number>(getHourlyRate())
  const [paymentDay, setPaymentDay] = useState<number>(getPaymentDay())
  const [adjustment, setAdjustment] = useState<number>(0)
  const [adjustmentNote, setAdjustmentNote] = useState<string>("")
  const [stats, setStats] = useState<ShiftStats>({
    totalHours: 0,
    totalShifts: 0,
    totalAdvance: 0,
    totalWage: 0,
  })
  const [filteredShifts, setFilteredShifts] = useState<Shift[]>([])

  useEffect(() => {
    const allShifts = getShifts()
    setShifts(allShifts)

    const filtered = filterShiftsByPeriod(allShifts, period, paymentDay)
    setFilteredShifts(filtered)
    setStats(calculateStats(filtered, hourlyRate, adjustment))
  }, [period, hourlyRate, paymentDay, adjustment])

  const handlePeriodChange = (value: Period) => {
    playClickSound()
    setPeriod(value)
  }

  const handleAdjustmentChange = (value: number) => {
    setAdjustment(value)
  }

  const handleAdjustmentNoteChange = (value: string) => {
    setAdjustmentNote(value)
  }

  // Get period name for export
  const getPeriodName = () => {
    const periodNames = {
      thisWeek: "tento-tyden",
      lastWeek: "minuly-tyden",
      lastPayment: "od-posledni-vyplaty",
      month: "tento-mesic",
      year: "tento-rok",
      all: "vse",
    }
    return periodNames[period] || "obdobi"
  }

  return (
    <div className="page-transition">
      <Header />

      <div className="page-container">
        <PeriodSelector value={period} onChange={handlePeriodChange} />

        <div className="gradient-card p-6 shadow-xl transition-all duration-300 backdrop-blur-sm mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-primary-foreground flex items-center">
              <Wallet className="h-4 w-4 mr-2" />
              Celkem
            </h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                    <HelpCircle className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Celková částka k výplatě za vybrané období</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-3xl font-bold tracking-tight">{formatCurrency(stats.totalWage)}</p>
          <p className="text-xs mt-2 text-primary-foreground/70">
            {stats.totalHours.toFixed(1)} hodin × {formatCurrency(hourlyRate)}/h - {formatCurrency(stats.totalAdvance)}{" "}
            zálohy
          </p>

          <PaymentAdjustment
            adjustment={adjustment}
            note={adjustmentNote}
            onAdjustmentChange={handleAdjustmentChange}
            onNoteChange={handleAdjustmentNoteChange}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <StatsCard
                    title="Odpracováno"
                    value={`${stats.totalHours.toFixed(1)} h`}
                    description={`${stats.totalShifts} směn`}
                    icon={Clock}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Celkový počet odpracovaných hodin a směn</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <StatsCard title="Zálohy" value={formatCurrency(stats.totalAdvance)} icon={BanknoteIcon} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Celková částka vyplacených záloh</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Nové komponenty */}
        <WeeklyStats shifts={filteredShifts} hourlyRate={hourlyRate} />
        {/* Odstraněno: <ExportData shifts={filteredShifts} hourlyRate={hourlyRate} period={getPeriodName()} /> */}
      </div>
    </div>
  )
}
