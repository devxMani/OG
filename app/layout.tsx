import type React from "react"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { GrainOverlay } from "@/components/grain-overlay"

export const metadata = {
  title: "Mani",
  description: "Personal website of Mani"
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider 
          attribute="class" 
          defaultTheme="light" 
          enableSystem={false} 
          disableTransitionOnChange
          themes={['light', 'dark', 'reading', 'matcha']}
        >
          <GrainOverlay />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
