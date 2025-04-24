import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Shift, ShiftStats, Period, PaymentDay } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

export function formatDateRange(startDate: Date, endDate: Date): string {
  const options: Intl.DateTimeFormatOptions = { day: "2-digit", month: "2-digit" }
  const start = new Intl.DateTimeFormat("cs-CZ", options).format(startDate)
  const end = new Intl.DateTimeFormat("cs-CZ", options).format(endDate)
  return `${start} - ${end}`
}

export function formatTime(timeString: string): string {
  return timeString
}

export function calculateHours(startTime: string, endTime: string): number {
  const [startHours, startMinutes] = startTime.split(":").map(Number)
  const [endHours, endMinutes] = endTime.split(":").map(Number)

  let hours = endHours - startHours
  let minutes = endMinutes - startMinutes

  if (minutes < 0) {
    hours -= 1
    minutes += 60
  }

  if (hours < 0) {
    hours += 24
  }

  // Return with one decimal place precision
  return Math.round((hours + minutes / 60) * 10) / 10
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

export function formatCurrency(amount: number): string {
  // Round to whole numbers
  const roundedAmount = Math.round(amount)
  // Fix: Use a different approach to format currency to avoid the "0" issue
  return `${roundedAmount} Kč`
}

export function getDayName(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("cs-CZ", { weekday: "long" }).format(date)
}

export function getDayNameShort(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("cs-CZ", { weekday: "short" }).format(date)
}

export function getLastPaymentDate(shifts: Shift[], paymentDay: PaymentDay): Date {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  // Find the last payday (the last day of the week matching paymentDay)
  const lastPaymentDate = new Date(today)

  // If today is payday, return today's date
  if (today.getDay() === paymentDay) {
    return today
  }

  // Otherwise find the last payday in the past
  while (lastPaymentDate.getDay() !== paymentDay) {
    lastPaymentDate.setDate(lastPaymentDate.getDate() - 1)
  }

  return lastPaymentDate
}

// Upravte funkci getStartOfWeek, aby brala v úvahu uživatelské nastavení prvního dne týdne
export function getStartOfWeek(date: Date, weekStartDay = 1): Date {
  const result = new Date(date)
  const day = result.getDay()
  // Výpočet rozdílu dnů s ohledem na uživatelské nastavení prvního dne týdne
  const diff = result.getDate() - ((7 + day - weekStartDay) % 7)
  result.setDate(diff)
  result.setHours(0, 0, 0, 0)
  return result
}

export function getEndOfWeek(date: Date): Date {
  const result = new Date(date)
  const day = result.getDay()
  const diff = result.getDate() + (day === 0 ? 0 : 7 - day) // adjust when day is Sunday
  result.setDate(diff)
  result.setHours(23, 59, 59, 999)
  return result
}

// Upravte funkci isNewWeek, aby brala v úvahu uživatelské nastavení prvního dne týdne
export function isNewWeek(currentDate: string, previousDate: string | null, weekStartDay = 1): boolean {
  if (!previousDate) return false

  const current = new Date(currentDate)
  const previous = new Date(previousDate)

  const currentWeekStart = getStartOfWeek(current, weekStartDay)
  const previousWeekStart = getStartOfWeek(previous, weekStartDay)

  return currentWeekStart.getTime() !== previousWeekStart.getTime()
}

export function filterShiftsByPeriod(shifts: Shift[], period: Period, paymentDay: PaymentDay = 5): Shift[] {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  switch (period) {
    case "lastPayment": {
      const lastPaymentDate = getLastPaymentDate(shifts, paymentDay)

      return shifts.filter((shift) => {
        const shiftDate = new Date(shift.date)
        return shiftDate >= lastPaymentDate
      })
    }
    case "month": {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

      return shifts.filter((shift) => {
        const shiftDate = new Date(shift.date)
        return shiftDate >= startOfMonth && shiftDate <= endOfMonth
      })
    }
    case "year": {
      const startOfYear = new Date(today.getFullYear(), 0, 1)
      const endOfYear = new Date(today.getFullYear(), 11, 31)

      return shifts.filter((shift) => {
        const shiftDate = new Date(shift.date)
        return shiftDate >= startOfYear && shiftDate <= endOfYear
      })
    }
    case "thisWeek": {
      const startOfWeek = getStartOfWeek(today)
      const endOfWeek = getEndOfWeek(today)

      return shifts.filter((shift) => {
        const shiftDate = new Date(shift.date)
        return shiftDate >= startOfWeek && shiftDate <= endOfWeek
      })
    }
    case "lastWeek": {
      const lastWeekToday = new Date(today)
      lastWeekToday.setDate(today.getDate() - 7)
      const startOfLastWeek = getStartOfWeek(lastWeekToday)
      const endOfLastWeek = getEndOfWeek(lastWeekToday)

      return shifts.filter((shift) => {
        const shiftDate = new Date(shift.date)
        return shiftDate >= startOfLastWeek && shiftDate <= endOfLastWeek
      })
    }
    case "all":
    default:
      return shifts
  }
}

export function getPeriodDateRange(period: Period): { start: Date; end: Date } | null {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  switch (period) {
    case "month": {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      return { start: startOfMonth, end: endOfMonth }
    }
    case "year": {
      const startOfYear = new Date(today.getFullYear(), 0, 1)
      const endOfYear = new Date(today.getFullYear(), 11, 31)
      return { start: startOfYear, end: endOfYear }
    }
    case "thisWeek": {
      const startOfWeek = getStartOfWeek(today)
      const endOfWeek = getEndOfWeek(today)
      return { start: startOfWeek, end: endOfWeek }
    }
    case "lastWeek": {
      const lastWeekToday = new Date(today)
      lastWeekToday.setDate(today.getDate() - 7)
      const startOfLastWeek = getStartOfWeek(lastWeekToday)
      const endOfLastWeek = getEndOfWeek(lastWeekToday)
      return { start: startOfLastWeek, end: endOfLastWeek }
    }
    default:
      return null
  }
}

// Calculate daily earnings (hourly rate * hours - advances for that day)
export function calculateDailyEarnings(shifts: Shift[], date: string, hourlyRate: number): number {
  // Get all shifts for the specific date
  const dateShifts = shifts.filter((shift) => shift.date === date)

  // Calculate total hours worked (excluding advances)
  const regularShifts = dateShifts.filter((shift) => !shift.isAdvance)
  const totalHours = regularShifts.reduce((sum, shift) => sum + shift.hours, 0)

  // Calculate total advances for the day
  const totalAdvances = dateShifts.reduce((sum, shift) => {
    if (shift.isAdvance || shift.advance) {
      return sum + (shift.advance || 0)
    }
    return sum
  }, 0)

  // Calculate net earnings
  return hourlyRate * totalHours - totalAdvances
}

export function calculateStats(shifts: Shift[], hourlyRate = 150, adjustment = 0): ShiftStats {
  // Filter shifts that are not advances for hours calculation
  const regularShifts = shifts.filter((shift) => !shift.isAdvance)
  const totalHours = regularShifts.reduce((sum, shift) => sum + shift.hours, 0)

  // Calculate total advances
  const totalAdvance = shifts.reduce((sum, shift) => {
    if (shift.isAdvance || shift.advance) {
      return sum + (shift.advance || 0)
    }
    return sum
  }, 0)

  // Total wage = hourly rate * hours worked - advances + adjustment
  const totalWage = hourlyRate * totalHours - totalAdvance + adjustment

  return {
    totalHours,
    totalShifts: regularShifts.length,
    totalAdvance,
    totalWage,
  }
}

export function getPaymentDayName(day: PaymentDay): string {
  const days = ["Neděle", "Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek", "Sobota"]
  return days[day]
}

// Group shifts by date for daily earnings calculation
export function groupShiftsByDate(shifts: Shift[]): Record<string, Shift[]> {
  return shifts.reduce(
    (groups, shift) => {
      const date = shift.date
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(shift)
      return groups
    },
    {} as Record<string, Shift[]>,
  )
}
