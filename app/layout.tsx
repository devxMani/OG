import type React from "react"
import { Instrument_Serif, Inter, Newsreader } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AccentThemeProvider } from "@/components/accent-theme-provider"
import { PaperBackground } from "@/components/paper-background"
import { GrainOverlay } from "@/components/grain-overlay"
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

const instrument = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-instrument",
  style: "italic",
  display: "swap",
})

const SITE_URL = "https://mani-gg.vercel.app"
const DESCRIPTION =
  "Mani — research, systems, taste. Voice AI, LLM evaluations, and interpretability-driven evals synthesis."

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Mani — Research, Systems, Taste",
    template: "%s — Mani",
  },
  description: DESCRIPTION,
  keywords: ["Mani", "voice AI", "LLM evaluations", "interpretability", "machine learning", "portfolio"],
  authors: [{ name: "Mani", url: SITE_URL }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Mani",
    title: "Mani — Research, Systems, Taste",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Mani — Research, Systems, Taste",
    description: DESCRIPTION,
    creator: "@devxmani",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={cn(inter.variable, newsreader.variable, instrument.variable)}>
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
            <GrainOverlay opacity={0.14} />
            <CuelumeProvider />
            {children}
          </AccentThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}