"use client"

import { useState, useCallback } from "react"

type ToastType = {
  title: string
  description?: string
  duration?: number
}

type ToastState = ToastType & {
  id: string
  visible: boolean
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastState[]>([])

  const toast = useCallback(({ title, description, duration = 3000 }: ToastType) => {
    const id = Math.random().toString(36).substring(2, 9)

    setToasts((prev) => [...prev, { id, title, description, duration, visible: true }])

    setTimeout(() => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, visible: false } : t)))

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 300)
    }, duration)
  }, [])

  return { toast, toasts }
}
