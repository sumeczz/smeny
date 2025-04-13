"use client"

import { useState, useEffect } from "react"
import Header from "@/components/header"
import PeriodSelector from "@/components/period-selector"
import StatsCard from "@/components/stats-card"
import { getShifts, getHourlyRate, getPaymentDay } from "@/lib/shift-service"
import type { Shift, Period, ShiftStats } from "@/lib/types"
import { filterShiftsByPeriod, calculateStats, formatCurrency } from "@/lib/utils"
import { Clock, BanknoteIcon, Wallet } from "lucide-react"
import { playClickSound } from "@/lib/sound-service"

export default function StatsPage() {
  const [shifts, setShifts] = useState<Shift[]>([])
  const [period, setPeriod] = useState<Period>("lastPayment")
  const [hourlyRate, setHourlyRate] = useState<number>(getHourlyRate())
  const [paymentDay, setPaymentDay] = useState<number>(getPaymentDay())
  const [stats, setStats] = useState<ShiftStats>({
    totalHours: 0,
    totalShifts: 0,
    totalAdvance: 0,
    totalWage: 0,
  })

  useEffect(() => {
    const allShifts = getShifts()
    setShifts(allShifts)

    const filteredShifts = filterShiftsByPeriod(allShifts, period, paymentDay)
    setStats(calculateStats(filteredShifts, hourlyRate))
  }, [period, hourlyRate, paymentDay])

  const handlePeriodChange = (value: Period) => {
    playClickSound()
    setPeriod(value)
  }

  return (
    <div>
      <Header />

      <div className="p-4 bg-gradient-to-br from-background to-muted/50">
        <PeriodSelector value={period} onChange={handlePeriodChange} />

        <div className="mb-5 gradient-card rounded-xl p-6 shadow-xl transition-colors duration-300 backdrop-blur-sm">
          <h3 className="text-sm font-medium text-primary-foreground mb-2 flex items-center">
            <Wallet className="h-4 w-4 mr-2" />
            Celkem
          </h3>
          <p className="text-4xl font-bold tracking-tight">{formatCurrency(stats.totalWage)}</p>
          <p className="text-xs mt-3 text-primary-foreground/50">
            {Math.round(stats.totalHours)} hodin × {formatCurrency(hourlyRate)}/h - {formatCurrency(stats.totalAdvance)}{" "}
            zálohy
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <StatsCard
            title="Odpracováno"
            value={`${Math.round(stats.totalHours)} h`}
            description={`${stats.totalShifts} směn`}
            icon={Clock}
          />
          <StatsCard title="Zálohy" value={formatCurrency(stats.totalAdvance)} icon={BanknoteIcon} />
        </div>
      </div>
    </div>
  )
}
