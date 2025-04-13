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

  // Round to whole numbers
  return Math.round(hours + minutes / 60)
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
    case "all":
    default:
      return shifts
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

export function calculateStats(shifts: Shift[], hourlyRate = 150): ShiftStats {
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

  // Total wage = hourly rate * hours worked - advances
  const totalWage = hourlyRate * totalHours - totalAdvance

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
