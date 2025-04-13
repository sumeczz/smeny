"use client"

import { useTheme } from "next-themes"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Moon } from "lucide-react"
import { playClickSound } from "@/lib/sound-service"

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const handleThemeChange = (checked: boolean) => {
    playClickSound()
    setTheme(checked ? "dark" : "light")
  }

  return (
    <div className="space-y-3 stats-card p-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
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
  )
}
