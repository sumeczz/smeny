"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Clock, Calendar, BanknoteIcon, Save } from "lucide-react"
import type { ShiftFormData, Shift } from "@/lib/types"
import { calculateHours } from "@/lib/utils"
import { addShift, updateShift } from "@/lib/shift-service"
import { playClickSound } from "@/lib/sound-service"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ShiftFormProps {
  initialData?: Shift
  isEditing?: boolean
}

export default function ShiftForm({ initialData, isEditing = false }: ShiftFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<ShiftFormData>({
    date: initialData?.date || new Date().toISOString().split("T")[0],
    startTime: initialData?.startTime || "07:00",
    endTime: initialData?.endTime || "14:30",
    notes: initialData?.notes || "",
    advance: initialData?.advance || 0,
    isAdvance: initialData?.isAdvance || false,
  })

  const [calculatedHours, setCalculatedHours] = useState<number>(
    initialData?.hours || calculateHours(formData.startTime, formData.endTime),
  )

  useEffect(() => {
    if (!formData.isAdvance) {
      setCalculatedHours(calculateHours(formData.startTime, formData.endTime))
    }
  }, [formData.startTime, formData.endTime, formData.isAdvance])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAdvanceChange = (value: string) => {
    setFormData((prev) => ({ ...prev, advance: Number(value) }))
    playClickSound()
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isAdvance: checked }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    playClickSound()

    if (isEditing && initialData) {
      updateShift(initialData.id, formData)
    } else {
      addShift(formData)
    }

    // Ensure we return to the list after submission
    router.push("/")
  }

  const advanceOptions = [
    { value: "0", label: "0 Kč" },
    { value: "500", label: "500 Kč" },
    { value: "1000", label: "1000 Kč" },
    { value: "1500", label: "1500 Kč" },
    { value: "2000", label: "2000 Kč" },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div className="flex items-center mb-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            playClickSound()
            router.push("/")
          }}
          className="mr-2 transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Zpět
        </Button>
      </div>

      <div className="space-y-4">
        <div className="stats-card p-4">
          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center text-sm">
              <Calendar className="h-3.5 w-3.5 mr-1.5 text-primary" />
              Datum
            </Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="input-field touch-manipulation"
            />
          </div>
        </div>

        {!formData.isAdvance && (
          <div className="stats-card p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime" className="flex items-center text-sm">
                  <Clock className="h-3.5 w-3.5 mr-1.5 text-primary" />
                  Čas od
                </Label>
                <Input
                  id="startTime"
                  name="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                  className="input-field touch-manipulation"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime" className="flex items-center text-sm">
                  <Clock className="h-3.5 w-3.5 mr-1.5 text-primary" />
                  Čas do
                </Label>
                <Input
                  id="endTime"
                  name="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                  className="input-field touch-manipulation"
                />
              </div>
            </div>

            <div className="space-y-2 mt-3">
              <Label className="flex items-center text-sm">
                <Clock className="h-3.5 w-3.5 mr-1.5 text-primary" />
                Odpracované hodiny
              </Label>
              <div className="p-2 border rounded-md bg-primary/10 text-sm font-medium">
                {Math.round(calculatedHours)} h
              </div>
            </div>
          </div>
        )}

        <div className="stats-card p-4">
          <div className="space-y-2">
            <Label htmlFor="advance" className="flex items-center text-sm">
              <BanknoteIcon className="h-3.5 w-3.5 mr-1.5 text-primary" />
              Záloha
            </Label>
            <Select value={formData.advance?.toString() || "0"} onValueChange={handleAdvanceChange}>
              <SelectTrigger id="advance" className="input-field h-9">
                <SelectValue placeholder="Vyberte zálohu" />
              </SelectTrigger>
              <SelectContent>
                {advanceOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="stats-card p-4">
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm flex items-center">
              <span className="i-lucide-file-text mr-1.5 text-primary"></span>
              Poznámky (volitelné)
            </Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="resize-none text-sm input-field"
            />
          </div>
        </div>
      </div>

      <div className="flex space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          className="flex-1 transition-colors duration-200"
          onClick={() => {
            playClickSound()
            router.push("/")
          }}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Zrušit
        </Button>
        <Button type="submit" className="flex-1 btn-primary transition-colors duration-200">
          <Save className="h-4 w-4 mr-1" />
          {isEditing ? "Uložit změny" : "Uložit záznam"}
        </Button>
      </div>
    </form>
  )
}
