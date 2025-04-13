import type React from "react"
import type { Metadata } from "next"
import { Outfit } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import BottomNavigation from "@/components/bottom-navigation"
import { Toaster } from "@/components/ui/toaster"

const outfit = Outfit({
  subsets: ["latin", "latin-ext"],
  variable: "--font-outfit",
})

export const metadata: Metadata = {
  title: "Zápis směn",
  description: "Aplikace pro zápis odpracovaných směn",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Zápis směn",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="cs" suppressHydrationWarning>
      <head />
      <body className={`${outfit.className} ${outfit.variable} transition-colors duration-300`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="flex flex-col min-h-screen max-w-md mx-auto">
            <main className="flex-1 pb-16">{children}</main>
            <BottomNavigation />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'