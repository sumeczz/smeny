"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { signInWithGoogle, signOut, getCurrentUser } from "@/lib/firebase-service"
import { LogIn, LogOut, Loader2 } from "lucide-react"
import { playClickSound } from "@/lib/sound-service"
import { useToast } from "@/hooks/use-toast"

export default function LoginButton() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const user = getCurrentUser()

  const handleLogin = async () => {
    playClickSound()
    setIsLoading(true)

    try {
      await signInWithGoogle()
      toast({
        title: "Přihlášení úspěšné",
        description: "Nyní můžete využívat cloudové zálohování dat.",
      })
    } catch (error) {
      toast({
        title: "Chyba při přihlašování",
        description: "Zkuste to prosím znovu později.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    playClickSound()
    setIsLoading(true)

    try {
      await signOut()
      toast({
        title: "Odhlášení úspěšné",
        description: "Byli jste úspěšně odhlášeni.",
      })
    } catch (error) {
      toast({
        title: "Chyba při odhlašování",
        description: "Zkuste to prosím znovu později.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (user) {
    return (
      <Button
        variant="outline"
        className="w-full h-10 text-destructive border-destructive/20 hover:bg-destructive/10"
        onClick={handleLogout}
        disabled={isLoading}
      >
        {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <LogOut className="h-4 w-4 mr-2" />}
        Odhlásit se ({user.displayName || user.email})
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      className="w-full h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30"
      onClick={handleLogin}
      disabled={isLoading}
    >
      {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <LogIn className="h-4 w-4 mr-2" />}
      Přihlásit se pomocí Google
    </Button>
  )
}
