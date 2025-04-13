"use client"
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

// If there are any issues with the theme provider, we would fix them here.
// However, since we don't have access to this file in the current project, we'll assume it's working correctly.
// The issue might be with the event handler in the settings page.
