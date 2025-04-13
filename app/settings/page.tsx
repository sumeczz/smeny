"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { clearAllShifts, getHourlyRate, setHourlyRate, getPaymentDay, setPaymentDay } from "@/lib/shift-service"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Wallet, Moon, Trash2, CalendarClock, Save, Volume2, VolumeX } from "lucide-react"
import type { PaymentDay } from "@/lib/types"
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

export default function SettingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()
  const [showClearDialog, setShowClearDialog] = useState(false)
  const [rate, setRate] = useState<number>(getHourlyRate())
  const [paymentDay, setPaymentDayState] = useState<PaymentDay>(getPaymentDay())
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(true)

  useEffect(() => {
    setSoundEnabledState(getSoundEnabled())
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

  const paymentDays = [
    { value: "1", label: "Pondělí" },
    { value: "2", label: "Úterý" },
    { value: "3", label: "Středa" },
    { value: "4", label: "Čtvrtek" },
    { value: "5", label: "Pátek" },
    { value: "6", label: "Sobota" },
    { value: "0", label: "Neděle" },
  ]

  return (
    <div>
      <Header title="Nastavení" />

      <div className="p-4 space-y-5">
        <div className="space-y-3 stats-card p-4 shadow-md">
          <h2 className="text-base font-medium flex items-center">
            <Wallet className="h-4 w-4 mr-2 text-primary" />
            Mzda
          </h2>

          <div className="space-y-2">
            <Label htmlFor="hourly-rate" className="text-sm">
              Hodinová sazba (Kč)
            </Label>
            <Input
              id="hourly-rate"
              type="number"
              min="0"
              step="10"
              value={rate}
              onChange={handleRateChange}
              className="input-field h-9"
            />
          </div>
        </div>

        <div className="space-y-3 stats-card p-4 shadow-md">
          <h2 className="text-base font-medium flex items-center">
            <CalendarClock className="h-4 w-4 mr-2 text-primary" />
            Výplata
          </h2>

          <div className="space-y-2">
            <Label htmlFor="payment-day" className="text-sm">
              Den výplaty
            </Label>
            <Select value={paymentDay.toString()} onValueChange={handlePaymentDayChange}>
              <SelectTrigger id="payment-day" className="input-field h-9">
                <SelectValue placeholder="Vyberte den výplaty" />
              </SelectTrigger>
              <SelectContent>
                {paymentDays.map((day) => (
                  <SelectItem key={day.value} value={day.value}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">Používá se pro výpočet období "Od poslední výplaty"</p>
          </div>
        </div>

        <div className="space-y-3 stats-card p-4 shadow-md">
          <h2 className="text-base font-medium flex items-center">
            <Moon className="h-4 w-4 mr-2 text-primary" />
            Vzhled
          </h2>

          <div className="flex items-center justify-between">
            <Label htmlFor="theme-toggle" className="cursor-pointer text-sm">
              Tmavý režim
            </Label>
            <Switch
              id="theme-toggle"
              checked={theme === "dark"}
              onCheckedChange={handleThemeChange}
              className="transition-opacity duration-200 data-[state=checked]:bg-primary"
            />
          </div>
        </div>

        <div className="space-y-3 stats-card p-4 shadow-md">
          <h2 className="text-base font-medium flex items-center">
            {soundEnabled ? (
              <Volume2 className="h-4 w-4 mr-2 text-primary" />
            ) : (
              <VolumeX className="h-4 w-4 mr-2 text-primary" />
            )}
            Zvuky
          </h2>

          <div className="flex items-center justify-between">
            <Label htmlFor="sound-toggle" className="cursor-pointer text-sm">
              Povolit zvuky
            </Label>
            <Switch
              id="sound-toggle"
              checked={soundEnabled}
              onCheckedChange={handleSoundChange}
              className="transition-opacity duration-200 data-[state=checked]:bg-primary"
            />
          </div>
        </div>

        <div className="space-y-3 stats-card p-4 shadow-md">
          <h2 className="text-base font-medium flex items-center">
            <Save className="h-4 w-4 mr-2 text-primary" />
            Data
          </h2>

          <Button
            variant="outline"
            className="w-full h-9 text-sm bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors duration-200"
            onClick={handleSaveData}
          >
            <Save className="h-4 w-4 mr-2" />
            Uložit data
          </Button>

          <Button
            variant="destructive"
            className="w-full h-9 text-sm btn-destructive mt-2"
            onClick={() => {
              playClickSound()
              setShowClearDialog(true)
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Vymazat všechna data
          </Button>
        </div>

        <div className="pt-4 text-center text-xs text-muted-foreground">
          <p>Zápis směn v1.2.0</p>
          <p className="mt-1">© 2025 Všechna práva vyhrazena</p>
        </div>
      </div>

      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Opravdu chcete vymazat všechna data?</AlertDialogTitle>
            <AlertDialogDescription>
              Tato akce je nevratná. Všechny vaše směny budou trvale odstraněny.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => playClickSound()}>Zrušit</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearData}>Vymazat</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
