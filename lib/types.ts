export interface Shift {
  id: string
  date: string
  startTime: string
  endTime: string
  hours: number
  notes?: string
  advance?: number
  isAdvance?: boolean
}

export interface ShiftFormData {
  date: string
  startTime: string
  endTime: string
  notes?: string
  advance?: number
  isAdvance?: boolean
}

export interface ShiftStats {
  totalHours: number
  totalShifts: number
  totalAdvance: number
  totalWage: number
}

export type Period = "lastPayment" | "month" | "year" | "all" | "thisWeek" | "lastWeek"

export type PaymentDay = 0 | 1 | 2 | 3 | 4 | 5 | 6 // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

export type WeekStartDay = 0 | 1 | 2 | 3 | 4 | 5 | 6 // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

export interface PaymentAdjustment {
  amount: number
  note: string
}

export interface ShiftReminder {
  id: string
  shiftDate: string
  reminderTime: string
  message: string
  isEnabled: boolean
}
