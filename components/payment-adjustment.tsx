"use client"

import type React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { PlusCircle, MinusCircle, Edit2 } from "lucide-react"
import { playClickSound } from "@/lib/sound-service"
import { formatCurrency } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface PaymentAdjustmentProps {
  adjustment: number
  note: string
  onAdjustmentChange: (adjustment: number) => void
  onNoteChange: (note: string) => void
}

export default function PaymentAdjustment({
  adjustment,
  note,
  onAdjustmentChange,
  onNoteChange,
}: PaymentAdjustmentProps) {
  const [isEditing, setIsEditing] = useState(false)

  const handleToggleEdit = () => {
    playClickSound()
    setIsEditing(!isEditing)
  }

  const handleAdjustmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value) || 0
    onAdjustmentChange(value)
  }

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onNoteChange(e.target.value)
  }

  return (
    <div className="mt-2">
      {!isEditing ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {adjustment !== 0 && (
              <span className={`text-xs ${adjustment > 0 ? "text-emerald-500" : "text-destructive"}`}>
                {adjustment > 0 ? "+" : ""}
                {formatCurrency(adjustment)}
                {note && ` (${note})`}
              </span>
            )}
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleToggleEdit}
                  className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Upravit korekci výplaty</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ) : (
        <div className="space-y-2 animate-fade-in pt-2">
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      playClickSound()
                      onAdjustmentChange(adjustment - 100)
                    }}
                    className="text-destructive hover:text-destructive/80 transition-colors"
                  >
                    <MinusCircle className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Snížit o 100 Kč</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Input
              type="number"
              value={adjustment}
              onChange={handleAdjustmentChange}
              className="h-7 text-xs text-primary-foreground bg-primary-foreground/10 border-primary-foreground/20 focus:border-primary-foreground/40 focus:ring-0"
              placeholder="Korekce (Kč)"
            />

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      playClickSound()
                      onAdjustmentChange(adjustment + 100)
                    }}
                    className="text-emerald-500 hover:text-emerald-400 transition-colors"
                  >
                    <PlusCircle className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Zvýšit o 100 Kč</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <button
              onClick={handleToggleEdit}
              className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
          </div>

          <Textarea
            value={note}
            onChange={handleNoteChange}
            placeholder="Poznámka ke korekci..."
            className="h-16 text-xs resize-none bg-primary-foreground/10 border-primary-foreground/20 focus:border-primary-foreground/40 focus:ring-0 text-primary-foreground"
          />
        </div>
      )}
    </div>
  )
}
