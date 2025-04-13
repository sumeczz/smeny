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
    <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border h-12 flex items-center px-4 transition-all duration-300">
      {title && <h1 className="text-lg font-semibold animate-fade-in">{title}</h1>}
      {isHomePage && (
        <Link
          href="/add"
          className="ml-auto transition-colors duration-200"
          aria-label="Přidat směnu"
          onClick={() => playClickSound()}
        >
          <PlusCircle className="h-5 w-5 text-primary" />
        </Link>
      )}
    </header>
  )
}
