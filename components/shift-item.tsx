"use client"

import { useState } from "react"
import type { Shift } from "@/lib/types"
import { formatDate, getDayName, formatCurrency } from "@/lib/utils"
import { Edit, Trash2, AlertCircle, Clock, Calendar, BanknoteIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { deleteShift, getHourlyRate } from "@/lib/shift-service"
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
import { Badge } from "@/components/ui/badge"
import { playClickSound, playDeleteSound } from "@/lib/sound-service"

interface ShiftItemProps {
  shift: Shift
  onDelete?: () => void
  allShifts: Shift[]
  index: number
}

export default function ShiftItem({ shift, onDelete, allShifts, index }: ShiftItemProps) {
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const hourlyRate = getHourlyRate()

  const handleEdit = () => {
    playClickSound()
    router.push(`/edit/${shift.id}`)
  }

  const handleDelete = () => {
    playDeleteSound()
    deleteShift(shift.id)
    if (onDelete) onDelete()
    setShowDeleteDialog(false)
  }

  const earnings = shift.isAdvance ? 0 : shift.hours * hourlyRate
  const hasAdvance = shift.advance && shift.advance > 0

  // Alternate background colors based on index
  const isEven = index % 2 === 0
  const bgColorClass = isEven ? "bg-muted/30" : "bg-card/70"

  return (
    <>
      <Card
        className={`mb-1.5 ${shift.isAdvance ? "border-secondary bg-secondary/10" : `border-border ${bgColorClass}`}`}
      >
        <CardContent className="p-2">
          <div className="flex flex-col h-[85px]">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <p className="text-xs font-medium">{formatDate(shift.date)}</p>
              <span className="text-xs text-muted-foreground ml-1">({getDayName(shift.date)})</span>

              {!shift.isAdvance ? (
                <div className="flex items-center ml-auto text-xs">
                  <Clock className="h-3 w-3 text-muted-foreground mr-1" />
                  <span className="text-foreground/80 text-xs">
                    {shift.startTime} - {shift.endTime}
                  </span>
                  <span className="ml-1 text-foreground/80 text-xs">({shift.hours} h)</span>
                </div>
              ) : (
                <Badge
                  variant="outline"
                  className="ml-auto text-xs py-0 h-4 bg-secondary/20 text-secondary-foreground border-secondary/30"
                >
                  <AlertCircle className="h-2.5 w-2.5 mr-1" />
                  Záloha
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between text-xs font-medium mt-1 h-4">
              {earnings > 0 && (
                <div className="flex items-center">
                  <BanknoteIcon className="h-3 w-3 mr-1 text-primary" />
                  <span className="text-primary font-semibold">{formatCurrency(earnings)}</span>
                </div>
              )}

              {hasAdvance && (
                <div className="flex items-center ml-auto">
                  <BanknoteIcon className="h-3 w-3 mr-1 text-destructive" />
                  <span className="text-destructive">{formatCurrency(shift.advance || 0)}</span>
                </div>
              )}

              {!earnings && !hasAdvance && <div className="h-4"></div>}
            </div>

            <div className="text-xs mt-1 text-muted-foreground min-h-[1rem] flex-grow">
              {shift.notes && <p className="truncate">{shift.notes}</p>}
            </div>

            <div className="flex justify-between mt-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleEdit}
                className="h-6 w-6 transition-colors duration-200"
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  playClickSound()
                  setShowDeleteDialog(true)
                }}
                className="h-6 w-6 text-destructive hover:text-destructive/80 transition-colors duration-200"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="animate-scale-in">
          <AlertDialogHeader>
            <AlertDialogTitle>Opravdu chcete smazat tento záznam?</AlertDialogTitle>
            <AlertDialogDescription>Tato akce je nevratná. Záznam bude trvale odstraněn.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => playClickSound()}>Zrušit</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Smazat</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
