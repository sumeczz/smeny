"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Cloud, Download, Trash2, Loader2, RefreshCw, Clock, AlertCircle } from "lucide-react"
import { playClickSound } from "@/lib/sound-service"
import { useToast } from "@/hooks/use-toast"
import {
  createBackup,
  getBackups,
  restoreFromBackup,
  removeBackup,
  isUserLoggedIn,
  formatBackupDate,
  type BackupRecord,
} from "@/lib/backup-service"
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
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function BackupManager() {
  const [backups, setBackups] = useState<BackupRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null)
  const [showRestoreDialog, setShowRestoreDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("autoBackupEnabled") === "true"
    }
    return false
  })

  const { toast } = useToast()

  // Načtení záloh při přihlášení
  useEffect(() => {
    if (isUserLoggedIn()) {
      loadBackups()
    }
  }, [])

  // Uložení nastavení automatického zálohování
  useEffect(() => {
    localStorage.setItem("autoBackupEnabled", autoBackupEnabled.toString())
  }, [autoBackupEnabled])

  const loadBackups = async () => {
    if (!isUserLoggedIn()) return

    setIsRefreshing(true)
    try {
      const userBackups = await getBackups()
      setBackups(userBackups)
    } catch (error) {
      toast({
        title: "Chyba při načítání záloh",
        description: "Zkuste to prosím znovu později.",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleCreateBackup = async () => {
    playClickSound()
    setIsLoading(true)

    try {
      const backupId = await createBackup()
      if (backupId) {
        toast({
          title: "Záloha vytvořena",
          description: "Vaše data byla úspěšně zálohována do cloudu.",
        })
        await loadBackups()
      } else {
        toast({
          title: "Chyba při vytváření zálohy",
          description: "Zkuste to prosím znovu později.",
        })
      }
    } catch (error) {
      toast({
        title: "Chyba při vytváření zálohy",
        description: "Zkuste to prosím znovu později.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRestoreBackup = async () => {
    if (!selectedBackup) return

    playClickSound()
    setShowRestoreDialog(false)
    setIsLoading(true)

    try {
      const success = await restoreFromBackup(selectedBackup)
      if (success) {
        toast({
          title: "Data obnovena",
          description: "Vaše data byla úspěšně obnovena ze zálohy.",
        })
        // Obnovení stránky pro načtení obnovených dat
        window.location.reload()
      } else {
        toast({
          title: "Chyba při obnovování dat",
          description: "Zkuste to prosím znovu později.",
        })
      }
    } catch (error) {
      toast({
        title: "Chyba při obnovování dat",
        description: "Zkuste to prosím znovu později.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteBackup = async () => {
    if (!selectedBackup) return

    playClickSound()
    setShowDeleteDialog(false)
    setIsLoading(true)

    try {
      const success = await removeBackup(selectedBackup)
      if (success) {
        toast({
          title: "Záloha smazána",
          description: "Vybraná záloha byla úspěšně smazána.",
        })
        await loadBackups()
      } else {
        toast({
          title: "Chyba při mazání zálohy",
          description: "Zkuste to prosím znovu později.",
        })
      }
    } catch (error) {
      toast({
        title: "Chyba při mazání zálohy",
        description: "Zkuste to prosím znovu později.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleAutoBackup = (checked: boolean) => {
    playClickSound()
    setAutoBackupEnabled(checked)
  }

  if (!isUserLoggedIn()) {
    return (
      <div className="flex flex-col items-center justify-center p-4 text-center">
        <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">Pro využití cloudového zálohování se nejprve přihlaste.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <Label htmlFor="auto-backup" className="form-label cursor-pointer">
          Automatické zálohování
        </Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Switch
                id="auto-backup"
                checked={autoBackupEnabled}
                onCheckedChange={handleToggleAutoBackup}
                className="transition-all duration-200 data-[state=checked]:bg-primary"
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>Automaticky zálohuje data jednou denně</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="flex space-x-2">
        <Button
          variant="outline"
          className="flex-1 h-10 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
          onClick={handleCreateBackup}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Cloud className="h-4 w-4 mr-2" />}
          Vytvořit zálohu
        </Button>

        <Button variant="outline" size="icon" className="h-10 w-10" onClick={loadBackups} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {backups.length === 0 ? (
          <div className="text-center p-4 border border-dashed rounded-lg text-muted-foreground">
            <p className="text-sm">Zatím nemáte žádné zálohy</p>
          </div>
        ) : (
          backups.map((backup) => (
            <div
              key={backup.id}
              className="border rounded-lg p-3 flex items-center justify-between bg-card hover:border-primary/30 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center">
                  <Cloud className="h-4 w-4 mr-2 text-primary" />
                  <span className="text-sm font-medium">{backup.name}</span>
                </div>
                <div className="flex items-center mt-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{formatBackupDate(backup.createdAt)}</span>
                </div>
              </div>
              <div className="flex space-x-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-primary hover:text-primary/80"
                        onClick={() => {
                          playClickSound()
                          setSelectedBackup(backup.id)
                          setShowRestoreDialog(true)
                        }}
                        disabled={isLoading}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Obnovit data z této zálohy</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive/80"
                        onClick={() => {
                          playClickSound()
                          setSelectedBackup(backup.id)
                          setShowDeleteDialog(true)
                        }}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Smazat tuto zálohu</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          ))
        )}
      </div>

      <AlertDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <AlertDialogContent className="animate-scale-in rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="h2">Obnovit data ze zálohy?</AlertDialogTitle>
            <AlertDialogDescription>
              Tato akce přepíše všechna vaše aktuální data. Chcete pokračovat?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => playClickSound()} className="rounded-lg">
              Zrušit
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleRestoreBackup} className="rounded-lg">
              Obnovit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="animate-scale-in rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="h2">Smazat zálohu?</AlertDialogTitle>
            <AlertDialogDescription>Tato akce je nevratná. Záloha bude trvale odstraněna.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => playClickSound()} className="rounded-lg">
              Zrušit
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBackup} className="rounded-lg">
              Smazat
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
