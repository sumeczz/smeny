"use client"

import { BanknoteIcon, Calendar, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { playClickSound } from "@/lib/sound-service"

const navItems = [
  {
    href: "/",
    icon: Calendar,
    label: "Směny",
  },
  {
    href: "/stats",
    icon: BanknoteIcon,
    label: "Výplata",
  },
  {
    href: "/settings",
    icon: Settings,
    label: "Nastavení",
  },
]

export default function BottomNavigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-sm border-t border-border h-14 flex items-center justify-around max-w-md mx-auto transition-all duration-300">
      {navItems.map((item) => {
        const isActive = pathname === item.href

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => playClickSound()}
            className={cn("nav-item", isActive ? "nav-item-active" : "nav-item-inactive")}
          >
            <item.icon className="h-4 w-4 mb-1" />
            <span className="text-xs">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
