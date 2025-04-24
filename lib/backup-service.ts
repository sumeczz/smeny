"use client"

import { saveBackup, getUserBackups, getBackup, deleteBackup, getCurrentUser, getLastBackup } from "./firebase-service"
import { getShifts, getHourlyRate, getPaymentDay, getSoundEnabled } from "./shift-service"
import type { Shift } from "./types"

// Struktura zálohy
export interface BackupData {
  shifts: Shift[]
  hourlyRate: number
  paymentDay: number
  soundEnabled: boolean
  version: string
  timestamp: number
}

// Struktura záznamu o záloze
export interface BackupRecord {
  id: string
  userId: string
  name: string
  createdAt: Date
  data: BackupData
}

// Vytvoření zálohy
export const createBackup = async (name = "Manuální záloha"): Promise<string | null> => {
  try {
    const user = getCurrentUser()
    if (!user) return null

    const backupData: BackupData = {
      shifts: getShifts(),
      hourlyRate: getHourlyRate(),
      paymentDay: getPaymentDay(),
      soundEnabled: getSoundEnabled(),
      version: "1.3.0", // Verze aplikace
      timestamp: Date.now(),
    }

    return await saveBackup(user.uid, backupData, name)
  } catch (error) {
    console.error("Chyba při vytváření zálohy:", error)
    return null
  }
}

// Automatické zálohování
export const autoBackup = async (): Promise<string | null> => {
  try {
    const user = getCurrentUser()
    if (!user) return null

    // Kontrola, zda již existuje záloha z dnešního dne
    const lastBackup = await getLastBackup(user.uid)
    if (lastBackup) {
      const lastBackupDate = new Date(lastBackup.createdAt)
      const today = new Date()

      // Pokud již existuje záloha z dnešního dne, nevytvářet novou
      if (
        lastBackupDate.getDate() === today.getDate() &&
        lastBackupDate.getMonth() === today.getMonth() &&
        lastBackupDate.getFullYear() === today.getFullYear()
      ) {
        return lastBackup.id
      }
    }

    // Vytvoření nové automatické zálohy
    return await createBackup("Automatická záloha")
  } catch (error) {
    console.error("Chyba při automatickém zálohování:", error)
    return null
  }
}

// Získání všech záloh uživatele
export const getBackups = async (): Promise<BackupRecord[]> => {
  try {
    const user = getCurrentUser()
    if (!user) return []

    return (await getUserBackups(user.uid)) as BackupRecord[]
  } catch (error) {
    console.error("Chyba při získávání záloh:", error)
    return []
  }
}

// Obnovení dat ze zálohy
export const restoreFromBackup = async (backupId: string): Promise<boolean> => {
  try {
    const backup = (await getBackup(backupId)) as BackupRecord
    if (!backup) return false

    const data = backup.data

    // Uložení dat do localStorage
    localStorage.setItem("shifts", JSON.stringify(data.shifts))
    localStorage.setItem("hourlyRate", data.hourlyRate.toString())
    localStorage.setItem("paymentDay", data.paymentDay.toString())
    localStorage.setItem("soundEnabled", data.soundEnabled.toString())

    return true
  } catch (error) {
    console.error("Chyba při obnovování ze zálohy:", error)
    return false
  }
}

// Smazání zálohy
export const removeBackup = async (backupId: string): Promise<boolean> => {
  try {
    await deleteBackup(backupId)
    return true
  } catch (error) {
    console.error("Chyba při mazání zálohy:", error)
    return false
  }
}

// Kontrola, zda je uživatel přihlášen
export const isUserLoggedIn = (): boolean => {
  return !!getCurrentUser()
}

// Formátování data zálohy
export const formatBackupDate = (date: Date): string => {
  return new Intl.DateTimeFormat("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}
