"use client"

import type { ShiftReminder } from "./types"
import { generateId } from "./utils"

const REMINDERS_STORAGE_KEY = "shiftReminders"
const REMINDERS_ENABLED_KEY = "remindersEnabled"

// Získání všech připomenutí
export function getReminders(): ShiftReminder[] {
  if (typeof window === "undefined") return []

  const storedReminders = localStorage.getItem(REMINDERS_STORAGE_KEY)
  return storedReminders ? JSON.parse(storedReminders) : []
}

// Přidání nového připomenutí
export function addReminder(reminder: Omit<ShiftReminder, "id">): ShiftReminder {
  const reminders = getReminders()

  const newReminder: ShiftReminder = {
    id: generateId(),
    ...reminder,
  }

  const updatedReminders = [...reminders, newReminder]
  localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(updatedReminders))

  scheduleReminder(newReminder)

  return newReminder
}

// Aktualizace připomenutí
export function updateReminder(id: string, reminderData: Partial<ShiftReminder>): ShiftReminder | null {
  const reminders = getReminders()
  const reminderIndex = reminders.findIndex((reminder) => reminder.id === id)

  if (reminderIndex === -1) return null

  const updatedReminder: ShiftReminder = {
    ...reminders[reminderIndex],
    ...reminderData,
  }

  reminders[reminderIndex] = updatedReminder
  localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(reminders))

  if (updatedReminder.isEnabled) {
    scheduleReminder(updatedReminder)
  }

  return updatedReminder
}

// Smazání připomenutí
export function deleteReminder(id: string): boolean {
  const reminders = getReminders()
  const filteredReminders = reminders.filter((reminder) => reminder.id !== id)

  if (filteredReminders.length === reminders.length) return false

  localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(filteredReminders))
  return true
}

// Kontrola, zda jsou připomenutí povolena
export function areRemindersEnabled(): boolean {
  if (typeof window === "undefined") return false

  const enabled = localStorage.getItem(REMINDERS_ENABLED_KEY)
  return enabled === "true"
}

// Nastavení povolení připomenutí
export function setRemindersEnabled(enabled: boolean): void {
  localStorage.setItem(REMINDERS_ENABLED_KEY, enabled.toString())
}

// Naplánování připomenutí
function scheduleReminder(reminder: ShiftReminder): void {
  if (!reminder.isEnabled || typeof window === "undefined") return

  const reminderDate = new Date(`${reminder.shiftDate}T${reminder.reminderTime}`)
  const now = new Date()

  // Pokud je čas připomenutí v minulosti, neprovádět nic
  if (reminderDate <= now) return

  // Výpočet času do připomenutí v milisekundách
  const timeUntilReminder = reminderDate.getTime() - now.getTime()

  // Naplánování připomenutí
  setTimeout(() => {
    showNotification(reminder)
  }, timeUntilReminder)
}

// Zobrazení notifikace
function showNotification(reminder: ShiftReminder): void {
  if (!areRemindersEnabled() || typeof window === "undefined") return

  // Kontrola podpory notifikací v prohlížeči
  if (!("Notification" in window)) {
    alert(`Připomenutí směny: ${reminder.message}`)
    return
  }

  // Kontrola oprávnění pro notifikace
  if (Notification.permission === "granted") {
    new Notification("Připomenutí směny", {
      body: reminder.message,
      icon: "/icons/icon-192x192.png",
    })
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        new Notification("Připomenutí směny", {
          body: reminder.message,
          icon: "/icons/icon-192x192.png",
        })
      }
    })
  }
}

// Inicializace připomenutí při načtení aplikace
export function initializeReminders(): void {
  if (typeof window === "undefined" || !areRemindersEnabled()) return

  const reminders = getReminders()
  const now = new Date()

  // Naplánování všech budoucích připomenutí
  reminders.forEach((reminder) => {
    if (!reminder.isEnabled) return

    const reminderDate = new Date(`${reminder.shiftDate}T${reminder.reminderTime}`)

    // Pokud je čas připomenutí v budoucnosti, naplánovat připomenutí
    if (reminderDate > now) {
      scheduleReminder(reminder)
    }
  })
}

// Požádání o povolení notifikací
export function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return Promise.resolve("denied" as NotificationPermission)
  }

  return Notification.requestPermission()
}
