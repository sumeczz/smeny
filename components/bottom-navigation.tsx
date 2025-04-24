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
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const isActive = pathname === item.href

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => playClickSound()}
            className={cn("nav-item", isActive ? "nav-item-active" : "nav-item-inactive")}
          >
            <item.icon className="h-5 w-5 mb-1" />
            <span className="text-xs">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
