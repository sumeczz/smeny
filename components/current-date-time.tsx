"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"

export default function CurrentDateTime() {
  const [currentTime, setCurrentTime] = useState("")
  const [currentDate, setCurrentDate] = useState("")
  const [currentDay, setCurrentDay] = useState("")

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date()

      // Format time: HH:MM
      const hours = now.getHours().toString().padStart(2, "0")
      const minutes = now.getMinutes().toString().padStart(2, "0")
      setCurrentTime(`${hours}:${minutes}`)

      // Format date: DD.MM.YYYY
      const day = now.getDate().toString().padStart(2, "0")
      const month = (now.getMonth() + 1).toString().padStart(2, "0")
      const year = now.getFullYear()
      setCurrentDate(`${day}.${month}.${year}`)

      // Get day name in Czech
      const days = ["Neděle", "Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek", "Sobota"]
      setCurrentDay(days[now.getDay()])
    }

    // Update immediately and then every minute
    updateDateTime()
    const interval = setInterval(updateDateTime, 60000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center">
      <Clock className="h-4 w-4 mr-1.5 text-primary" />
      <div className="flex items-center">
        <span className="text-lg font-semibold mr-2">{currentTime}</span>
        <div className="flex flex-col">
          <span className="text-xs font-medium">{currentDay}</span>
          <span className="text-xs text-muted-foreground">{currentDate}</span>
        </div>
      </div>
    </div>
  )
}
