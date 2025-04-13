"use client"

import type { Shift, ShiftFormData, PaymentDay } from "./types"
import { calculateHours, generateId } from "./utils"

const SHIFTS_STORAGE_KEY = "shifts"
const HOURLY_RATE_KEY = "hourlyRate"
const PAYMENT_DAY_KEY = "paymentDay"

export function getShifts(): Shift[] {
  if (typeof window === "undefined") return []

  const storedShifts = localStorage.getItem(SHIFTS_STORAGE_KEY)
  return storedShifts ? JSON.parse(storedShifts) : []
}

export function addShift(shiftData: ShiftFormData): Shift {
  const shifts = getShifts()

  const newShift: Shift = {
    id: generateId(),
    date: shiftData.date,
    startTime: shiftData.startTime,
    endTime: shiftData.endTime,
    hours: shiftData.isAdvance ? 0 : calculateHours(shiftData.startTime, shiftData.endTime),
    notes: shiftData.notes,
    advance: shiftData.advance,
    isAdvance: shiftData.isAdvance,
  }

  const updatedShifts = [newShift, ...shifts]
  localStorage.setItem(SHIFTS_STORAGE_KEY, JSON.stringify(updatedShifts))

  return newShift
}

export function updateShift(id: string, shiftData: ShiftFormData): Shift | null {
  const shifts = getShifts()
  const shiftIndex = shifts.findIndex((shift) => shift.id === id)

  if (shiftIndex === -1) return null

  const updatedShift: Shift = {
    ...shifts[shiftIndex],
    date: shiftData.date,
    startTime: shiftData.startTime,
    endTime: shiftData.endTime,
    hours: shiftData.isAdvance ? 0 : calculateHours(shiftData.startTime, shiftData.endTime),
    notes: shiftData.notes,
    advance: shiftData.advance,
    isAdvance: shiftData.isAdvance,
  }

  shifts[shiftIndex] = updatedShift
  localStorage.setItem(SHIFTS_STORAGE_KEY, JSON.stringify(shifts))

  return updatedShift
}

export function deleteShift(id: string): boolean {
  const shifts = getShifts()
  const filteredShifts = shifts.filter((shift) => shift.id !== id)

  if (filteredShifts.length === shifts.length) return false

  localStorage.setItem(SHIFTS_STORAGE_KEY, JSON.stringify(filteredShifts))
  return true
}

export function clearAllShifts(): void {
  localStorage.removeItem(SHIFTS_STORAGE_KEY)
}

export function getHourlyRate(): number {
  if (typeof window === "undefined") return 150

  const rate = localStorage.getItem(HOURLY_RATE_KEY)
  return rate ? Number(rate) : 150
}

export function setHourlyRate(rate: number): void {
  localStorage.setItem(HOURLY_RATE_KEY, rate.toString())
}

export function getPaymentDay(): PaymentDay {
  if (typeof window === "undefined") return 5 // Friday as default

  const day = localStorage.getItem(PAYMENT_DAY_KEY)
  return day ? (Number(day) as PaymentDay) : 5
}

export function setPaymentDay(day: PaymentDay): void {
  localStorage.setItem(PAYMENT_DAY_KEY, day.toString())
}
