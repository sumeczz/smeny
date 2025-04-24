"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Bell, Trash2, Plus, Clock, Calendar } from "lucide-react"
import { playClickSound } from "@/lib/sound-service"
import { useToast } from "@/hooks/use-toast"
import {
  getReminders,
  addReminder,
  updateReminder,
  deleteReminder,
  areRemindersEnabled,
  setRemindersEnabled,
  requestNotificationPermission,
  initializeReminders,
} from "@/lib/reminder-service"
import type { ShiftReminder } from "@/lib/types"
import { formatDate } from "@/lib/utils"
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function ReminderManager() {
  const [reminders, setReminders] = useState<ShiftReminder[]>([])
  const [isAddingReminder, setIsAddingReminder] = useState(false)
  const [newReminder, setNewReminder] = useState({
    shiftDate: new Date().toISOString().split("T")[0],
    reminderTime: "08:00",
    message: "Nezapomeň na směnu!",
    isEnabled: true,
  })
  const [selectedReminderId, setSelectedReminderId] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [remindersEnabled, setRemindersEnabledState] = useState(areRemindersEnabled())

  const { toast } = useToast()

  // Načtení připomenutí při načtení komponenty
  useEffect(() => {
    setReminders(getReminders())
    initializeReminders()
  }, [])

  // Změna stavu povolení připomenutí
  const handleRemindersEnabledChange = async (checked: boolean) => {
    playClickSound()
    setRemindersEnabledState(checked)
    setRemindersEnabled(checked)

    if (checked) {
      // Požádání o povolení notifikací
      const permission = await requestNotificationPermission()
      if (permission !== "granted") {
        toast({
          title: "Notifikace nejsou povoleny",
          description: "Pro zobrazení připomenutí povolte notifikace v nastavení prohlížeče.",
        })
      } else {
        initializeReminders()
      }
    }
  }

  // Přidání nového připomenutí
  const handleAddReminder = () => {
    playClickSound()
    addReminder(newReminder)
    setReminders(getReminders())
    setIsAddingReminder(false)
    setNewReminder({
      shiftDate: new Date().toISOString().split("T")[0],
      reminderTime: "08:00",
      message: "Nezapomeň na směnu!",
      isEnabled: true,
    })

    toast({
      title: "Připomenutí přidáno",
      description: "Nové připomenutí bylo úspěšně přidáno.",
    })
  }

  // Změna stavu povolení konkrétního připomenutí
  const handleReminderEnabledChange = (id: string, checked: boolean) => {
    playClickSound()
    updateReminder(id, { isEnabled: checked })
    setReminders(getReminders())
  }

  // Smazání připomenutí
  const handleDeleteReminder = () => {
    if (!selectedReminderId) return

    playClickSound()
    deleteReminder(selectedReminderId)
    setReminders(getReminders())
    setShowDeleteDialog(false)
    setSelectedReminderId(null)

    toast({
      title: "Připomenutí smazáno",
      description: "Připomenutí bylo úspěšně smazáno.",
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <Label htmlFor="reminders-enabled" className="form-label cursor-pointer">
          Povolit připomenutí
        </Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Switch
                id="reminders-enabled"
                checked={remindersEnabled}
                onCheckedChange={handleRemindersEnabledChange}
                className="transition-all duration-200 data-[state=checked]:bg-primary"
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>Povolí zobrazování připomenutí směn</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {remindersEnabled && (
        <>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {reminders.length === 0 && !isAddingReminder ? (
              <div className="text-center p-4 border border-dashed rounded-lg text-muted-foreground">
                <p className="text-sm">Zatím nemáte žádná připomenutí</p>
              </div>
            ) : (
              <>
                {reminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className="border rounded-lg p-3 flex items-center justify-between bg-card hover:border-primary/30 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center">
                        <Bell className="h-4 w-4 mr-2 text-primary" />
                        <span className="text-sm font-medium">{reminder.message}</span>
                      </div>
                      <div className="flex items-center mt-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span className="mr-2">{formatDate(reminder.shiftDate)}</span>
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{reminder.reminderTime}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={reminder.isEnabled}
                        onCheckedChange={(checked) => handleReminderEnabledChange(reminder.id, checked)}
                        className="transition-all duration-200 data-[state=checked]:bg-primary"
                      />
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive/80"
                              onClick={() => {
                                playClickSound()
                                setSelectedReminderId(reminder.id)
                                setShowDeleteDialog(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Smazat připomenutí</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                ))}

                {isAddingReminder && (
                  <div className="border rounded-lg p-3 space-y-3 bg-card animate-fade-in">
                    <div className="flex items-center">
                      <Bell className="h-4 w-4 mr-2 text-primary" />
                      <span className="text-sm font-medium">Nové připomenutí</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="shift-date" className="text-xs">
                          Datum směny
                        </Label>
                        <Input
                          id="shift-date"
                          type="date"
                          value={newReminder.shiftDate}
                          onChange={(e) => setNewReminder({ ...newReminder, shiftDate: e.target.value })}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="reminder-time" className="text-xs">
                          Čas připomenutí
                        </Label>
                        <Input
                          id="reminder-time"
                          type="time"
                          value={newReminder.reminderTime}
                          onChange={(e) => setNewReminder({ ...newReminder, reminderTime: e.target.value })}
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="reminder-message" className="text-xs">
                        Zpráva
                      </Label>
                      <Input
                        id="reminder-message"
                        value={newReminder.message}
                        onChange={(e) => setNewReminder({ ...newReminder, message: e.target.value })}
                        className="h-8 text-xs"
                      />
                    </div>

                    <div className="flex space-x-2 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs flex-1"
                        onClick={() => {
                          playClickSound()
                          setIsAddingReminder(false)
                        }}
                      >
                        Zrušit
                      </Button>
                      <Button variant="default" size="sm" className="h-8 text-xs flex-1" onClick={handleAddReminder}>
                        Přidat
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {!isAddingReminder && (
            <Button
              variant="outline"
              className="w-full h-9"
              onClick={() => {
                playClickSound()
                setIsAddingReminder(true)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Přidat připomenutí
            </Button>
          )}
        </>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="animate-scale-in rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="h2">Smazat připomenutí?</AlertDialogTitle>
            <AlertDialogDescription>Tato akce je nevratná. Připomenutí bude trvale odstraněno.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => playClickSound()} className="rounded-lg">
              Zrušit
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteReminder} className="rounded-lg">
              Smazat
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
