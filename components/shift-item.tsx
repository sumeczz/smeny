"use client"

import { useState } from "react"
import type { Shift } from "@/lib/types"
import { formatDate, getDayName, formatCurrency } from "@/lib/utils"
import { Edit, Trash2, AlertCircle, Clock, Calendar, BanknoteIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ShiftItemProps {
  shift: Shift
  onDelete?: () => void
  allShifts: Shift[]
  index: number
  isNewWeek?: boolean
}

export default function ShiftItem({ shift, onDelete, allShifts, index, isNewWeek }: ShiftItemProps) {
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

  // Format hours with one decimal place if needed
  const formattedHours = shift.hours % 1 === 0 ? shift.hours : shift.hours.toFixed(1)

  return (
    <>
      {isNewWeek && (
        <div className="flex items-center my-2 opacity-60">
          <div className="flex-grow border-t border-border"></div>
          <span className="mx-2 text-xs text-muted-foreground font-medium">Nový týden</span>
          <div className="flex-grow border-t border-border"></div>
        </div>
      )}
      <div className={`shift-item mb-3 ${shift.isAdvance ? "border-secondary bg-secondary/10" : bgColorClass}`}>
        <div className="shift-item-content">
          <div className="shift-item-header">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <p className="text-xs font-medium">{formatDate(shift.date)}</p>
              <span className="text-xs text-muted-foreground ml-1">({getDayName(shift.date)})</span>
            </div>

            {!shift.isAdvance ? (
              <div className="flex items-center text-xs">
                <Clock className="h-3 w-3 text-muted-foreground mr-1" />
                <span className="text-foreground/80 text-xs">
                  {shift.startTime} - {shift.endTime}
                </span>
                <span className="ml-1 text-foreground/80 text-xs">({formattedHours} h)</span>
              </div>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge className="badge badge-secondary">
                      <AlertCircle className="h-2.5 w-2.5 mr-1" />
                      Záloha
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Záznam o vyplacené záloze</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          <div className="shift-item-body">
            <div className="flex items-center justify-between text-xs font-medium">
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
            </div>

            {shift.notes && (
              <div className="text-xs mt-2 text-muted-foreground">
                <p className="truncate">{shift.notes}</p>
              </div>
            )}
          </div>

          <div className="shift-item-footer">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleEdit}
                    className="h-7 w-7 rounded-full transition-colors duration-200"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Upravit záznam</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      playClickSound()
                      setShowDeleteDialog(true)
                    }}
                    className="h-7 w-7 rounded-full text-destructive hover:text-destructive/80 transition-colors duration-200"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Smazat záznam</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="animate-scale-in rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="h2">Opravdu chcete smazat tento záznam?</AlertDialogTitle>
            <AlertDialogDescription>Tato akce je nevratná. Záznam bude trvale odstraněn.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => playClickSound()} className="rounded-lg">
              Zrušit
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="rounded-lg">
              Smazat
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
