"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Header from "@/components/header"
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
    return <div className="p-4">Načítání...</div>
  }

  if (!shift) {
    return null
  }

  return (
    <div>
      <Header title="Upravit směnu" />
      <ShiftForm initialData={shift} isEditing />
    </div>
  )
}
