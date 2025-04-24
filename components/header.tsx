"use client"

import { PlusCircle } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { playClickSound } from "@/lib/sound-service"

interface HeaderProps {
  title?: string
}

export default function Header({ title }: HeaderProps) {
  const pathname = usePathname()
  const isHomePage = pathname === "/"

  return (
    <header className="header">
      {title && <h1 className="h1 animate-fade-in">{title}</h1>}
      {isHomePage && (
        <Link
          href="/add"
          className="ml-auto icon-button text-primary"
          aria-label="Přidat směnu"
          onClick={() => playClickSound()}
        >
          <PlusCircle className="h-5 w-5" />
        </Link>
      )}
    </header>
  )
}
