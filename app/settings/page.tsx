"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  clearAllShifts,
  getHourlyRate,
  setHourlyRate,
  getPaymentDay,
  setPaymentDay,
  getWeekStartDay,
  setWeekStartDay,
  getShifts,
} from "@/lib/shift-service"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Wallet, Moon, Trash2, CalendarClock, Save, Volume2, VolumeX, Cloud, BellRing, Download } from "lucide-react"
import type { PaymentDay, WeekStartDay } from "@/lib/types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { getSoundEnabled, setSoundEnabled, playClickSound } from "@/lib/sound-service"
import { useToast } from "@/hooks/use-toast"
import LoginButton from "@/components/login-button"
import BackupManager from "@/components/backup-manager"
import { autoBackup } from "@/lib/backup-service"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import ReminderManager from "@/components/reminder-manager"
import ExportData from "@/components/export-data"

export default function SettingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()
  const [showClearDialog, setShowClearDialog] = useState(false)
  const [rate, setRate] = useState<number>(getHourlyRate())
  const [paymentDay, setPaymentDayState] = useState<PaymentDay>(getPaymentDay())
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(true)
  const [weekStartDay, setWeekStartDayState] = useState<WeekStartDay>(getWeekStartDay())

  useEffect(() => {
    setSoundEnabledState(getSoundEnabled())

    // Kontrola automatického zálohování při načtení stránky
    const checkAutoBackup = async () => {
      const autoBackupEnabled = localStorage.getItem("autoBackupEnabled") === "true"
      if (autoBackupEnabled) {
        await autoBackup()
      }
    }

    checkAutoBackup()
  }, [])

  const handleClearData = () => {
    clearAllShifts()
    setShowClearDialog(false)
    router.refresh()
    toast({
      title: "Data vymazána",
      description: "Všechna data byla úspěšně vymazána.",
    })
  }

  const handleThemeChange = (checked: boolean) => {
    playClickSound()
    setTheme(checked ? "dark" : "light")
  }

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRate = Number(e.target.value)
    setRate(newRate)
    setHourlyRate(newRate)
  }

  const handlePaymentDayChange = (value: string) => {
    playClickSound()
    const day = Number(value) as PaymentDay
    setPaymentDayState(day)
    setPaymentDay(day)
  }

  const handleSoundChange = (checked: boolean) => {
    if (checked) playClickSound()
    setSoundEnabledState(checked)
    setSoundEnabled(checked)
  }

  const handleSaveData = () => {
    playClickSound()
    // Data is already saved in localStorage, so we just show a confirmation
    toast({
      title: "Data uložena",
      description: "Všechna data byla úspěšně uložena.",
    })
  }

  const handleWeekStartDayChange = (value: string) => {
    playClickSound()
    const day = Number(value) as WeekStartDay
    setWeekStartDayState(day)
    setWeekStartDay(day)
  }

  const paymentDays = [
    { value: "1", label: "Pondělí" },
    { value: "2", label: "Úterý" },
    { value: "3", label: "Středa" },
    { value: "4", label: "Čtvrtek" },
    { value: "5", label: "Pátek" },
    { value: "6", label: "Sobota" },
    { value: "0", label: "Neděle" },
  ]

  const weekDays = [
    { value: "1", label: "Pondělí" },
    { value: "2", label: "Úterý" },
    { value: "3", label: "Středa" },
    { value: "4", label: "Čtvrtek" },
    { value: "5", label: "Pátek" },
    { value: "6", label: "Sobota" },
    { value: "0", label: "Neděle" },
  ]

  return (
    <div className="page-transition">
      <Header title="Nastavení" />

      <div className="page-container">
        <div className="section">
          <div className="stats-card">
            <div className="section-title">
              <Wallet className="h-4 w-4 mr-2 text-primary" />
              Mzda
            </div>

            <div className="form-group mt-3">
              <Label htmlFor="hourly-rate" className="form-label">
                Hodinová sazba (Kč)
              </Label>
              <Input
                id="hourly-rate"
                type="number"
                min="0"
                step="10"
                value={rate}
                onChange={handleRateChange}
                className="input-field h-10"
              />
            </div>
          </div>
        </div>

        <div className="section">
          <div className="stats-card">
            <div className="section-title">
              <CalendarClock className="h-4 w-4 mr-2 text-primary" />
              Výplata
            </div>

            <div className="form-group mt-3">
              <Label htmlFor="payment-day" className="form-label">
                Den výplaty
              </Label>
              <Select value={paymentDay.toString()} onValueChange={handlePaymentDayChange}>
                <SelectTrigger id="payment-day" className="input-field h-10">
                  <SelectValue placeholder="Vyberte den výplaty" />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  {paymentDays.map((day) => (
                    <SelectItem key={day.value} value={day.value}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="form-hint">Používá se pro výpočet období "Od poslední výplaty"</p>
            </div>
          </div>
        </div>

        <div className="section">
          <div className="stats-card">
            <div className="section-title">
              <CalendarClock className="h-4 w-4 mr-2 text-primary" />
              Týden
            </div>

            <div className="form-group mt-3">
              <Label htmlFor="week-start-day" className="form-label">
                První den týdne
              </Label>
              <Select value={weekStartDay.toString()} onValueChange={handleWeekStartDayChange}>
                <SelectTrigger id="week-start-day" className="input-field h-10">
                  <SelectValue placeholder="Vyberte první den týdne" />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  {weekDays.map((day) => (
                    <SelectItem key={day.value} value={day.value}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="form-hint">Určuje, kdy se zobrazí označení "Nový týden" v seznamu směn</p>
            </div>
          </div>
        </div>

        <div className="section">
          <div className="stats-card">
            <div className="section-title">
              <Moon className="h-4 w-4 mr-2 text-primary" />
              Vzhled
            </div>

            <div className="flex items-center justify-between mt-3">
              <Label htmlFor="theme-toggle" className="form-label cursor-pointer">
                Tmavý režim
              </Label>
              <Switch
                id="theme-toggle"
                checked={theme === "dark"}
                onCheckedChange={handleThemeChange}
                className="transition-all duration-200 data-[state=checked]:bg-primary"
              />
            </div>
          </div>
        </div>

        <div className="section">
          <div className="stats-card">
            <div className="section-title">
              {soundEnabled ? (
                <Volume2 className="h-4 w-4 mr-2 text-primary" />
              ) : (
                <VolumeX className="h-4 w-4 mr-2 text-primary" />
              )}
              Zvuky
            </div>

            <div className="flex items-center justify-between mt-3">
              <Label htmlFor="sound-toggle" className="form-label cursor-pointer">
                Povolit zvuky
              </Label>
              <Switch
                id="sound-toggle"
                checked={soundEnabled}
                onCheckedChange={handleSoundChange}
                className="transition-all duration-200 data-[state=checked]:bg-primary"
              />
            </div>
          </div>
        </div>

        <div className="section">
          <div className="stats-card">
            <div className="section-title">
              <BellRing className="h-4 w-4 mr-2 text-primary" />
              Připomenutí směn
            </div>

            <div className="mt-3">
              <ReminderManager />
            </div>
          </div>
        </div>

        <div className="section">
          <div className="stats-card">
            <div className="section-title">
              <Cloud className="h-4 w-4 mr-2 text-primary" />
              Cloudové zálohování
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="ml-1 cursor-help">
                      <span className="text-xs text-muted-foreground">(beta)</span>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Funkce je ve vývoji a může se změnit</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="mt-3 space-y-4">
              <LoginButton />
              <BackupManager />
            </div>
          </div>
        </div>

        <div className="section">
          <div className="stats-card">
            <div className="section-title">
              <Download className="h-4 w-4 mr-2 text-primary" />
              Export dat
            </div>

            <div className="mt-3">
              <ExportData shifts={getShifts()} hourlyRate={rate} />
            </div>
          </div>
        </div>

        <div className="section">
          <div className="stats-card">
            <div className="section-title">
              <Save className="h-4 w-4 mr-2 text-primary" />
              Data
            </div>

            <div className="space-y-3 mt-3">
              <Button
                variant="outline"
                className="w-full h-10 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-all duration-200 rounded-lg"
                onClick={handleSaveData}
              >
                <Save className="h-4 w-4 mr-2" />
                Uložit data
              </Button>

              <Button
                variant="destructive"
                className="w-full h-10 btn-destructive"
                onClick={() => {
                  playClickSound()
                  setShowClearDialog(true)
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Vymazat všechna data
              </Button>
            </div>
          </div>
        </div>

        <div className="pt-4 text-center text-xs text-muted-foreground">
          <p>Zápis směn v1.3.0</p>
          <p className="mt-1">© 2025 Všechna práva vyhrazena</p>
        </div>
      </div>

      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="h2">Opravdu chcete vymazat všechna data?</AlertDialogTitle>
            <AlertDialogDescription>
              Tato akce je nevratná. Všechny vaše směny budou trvale odstraněny.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => playClickSound()} className="rounded-lg">
              Zrušit
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleClearData} className="rounded-lg">
              Vymazat
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
