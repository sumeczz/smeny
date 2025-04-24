"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import ShiftForm from "@/components/shift-form"
import { getShifts } from "@/lib/shift-service"
import type { Shift } from "@/lib/types"

export default function EditShiftPage() {
  const params = useParams()
  const router = useRouter()
  const [shift, setShift] = useState<Shift | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const id = params.id as string
    const shifts = getShifts()
    const foundShift = shifts.find((s) => s.id === id)

    if (!foundShift) {
      router.push("/")
      return
    }

    setShift(foundShift)
    setIsLoading(false)
  }, [params.id, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-pulse text-primary">Načítání...</div>
        </div>
      </div>
    )
  }

  if (!shift) {
    return null
  }

  return <ShiftForm initialData={shift} isEditing />
}
