import type React from "react"
import { Inter, Newsreader } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AccentThemeProvider } from "@/components/accent-theme-provider"
import { PaperBackground } from "@/components/paper-background"
import { CuelumeProvider } from "@/components/cuelume-provider"
import { cn } from "@/lib/utils"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
})

export const metadata = {
  title: "Mani",
  description: "Personal website of Mani"
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={cn(inter.variable, newsreader.variable)}>
      <body suppressHydrationWarning className="min-h-screen bg-transparent text-foreground relative overflow-x-hidden font-sans selection:bg-white/20">
        <ThemeProvider 
          attribute="class" 
          defaultTheme="dark" 
          enableSystem={false} 
          disableTransitionOnChange
          themes={['light', 'dark']}
        >
          <AccentThemeProvider>
            <PaperBackground />
            <CuelumeProvider />
            {children}
          </AccentThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
