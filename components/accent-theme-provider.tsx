"use client"

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react"
import { useTheme } from "next-themes"

// Spectral control points sampled in OKLab space matching Anandu Gopal's color engine
const Vt = [
  { p: 0.0012, L: 82.2, a: 0.072, b: 0.07 },
  { p: 0.2305, L: 87.8, a: -0.074, b: 0.167 },
  { p: 0.4883, L: 87.9, a: -0.174, b: 0.037 },
  { p: 0.7695, L: 82.3, a: 0.046, b: -0.09 },
  { p: 1, L: 82.1, a: 0.088, b: 0.049 }
]
const Id = 1.8

export function sf(i: number) {
  const l = Math.min(1, Math.max(0, i / 360))
  let s = Vt[0]
  let c = Vt[Vt.length - 1]
  if (l <= Vt[0].p) return { L: s.L, a: s.a, b: s.b }
  for (let p = 0; p < Vt.length - 1; p++) {
    if (l >= Vt[p].p && l <= Vt[p + 1].p) {
      s = Vt[p]
      c = Vt[p + 1]
      break
    }
  }
  const f = (l - s.p) / (c.p - s.p)
  return {
    L: s.L + (c.L - s.L) * f,
    a: s.a + (c.a - s.a) * f,
    b: s.b + (c.b - s.b) * f
  }
}

export const Ba = (i: number, l: number, s: number) =>
  `oklab(${i.toFixed(2)}% ${l.toFixed(4)} ${s.toFixed(4)})`

export function k0(i: number, l: number, s: number): string {
  const c = Math.pow(i + 0.3963377774 * l + 0.2158037573 * s, 3)
  const f = Math.pow(i - 0.1055613458 * l - 0.0638541728 * s, 3)
  const p = Math.pow(i - 0.0894841775 * l - 1.291485548 * s, 3)
  return (
    "#" +
    [
      4.0767416621 * c - 3.3077115913 * f + 0.2309699292 * p,
      -1.2684380046 * c + 2.6097574011 * f - 0.3413193965 * p,
      -0.0041960863 * c - 0.7034186147 * f + 1.707614701 * p
    ]
      .map((h) => {
        const y =
          h <= 0.0031308
            ? 12.92 * h
            : 1.055 * Math.pow(Math.max(h, 0), 0.4166666666666667) - 0.055
        return Math.round(Math.min(1, Math.max(0, y)) * 255)
          .toString(16)
          .padStart(2, "0")
      })
      .join("")
  )
}

interface AccentThemeContextType {
  hue: number
  setHue: (hue: number) => void
  accent: string
  accentDark: string
  accentVibrant: string
  accentLight: string
  theme: string
  setTheme: (theme: string) => void
  resolvedTheme: string
}

const AccentThemeContext = createContext<AccentThemeContextType | null>(null)

export function AccentThemeProvider({ children }: { children: React.ReactNode }) {
  // Default to 170 (emerald/teal green, as seen in the reference video)
  const [hue, setHueState] = useState<number>(170)
  const { theme = "dark", setTheme, resolvedTheme = "dark" } = useTheme()

  useEffect(() => {
    const savedHue = localStorage.getItem("portfolio_accent_hue")
    if (savedHue !== null) {
      const parsed = parseFloat(savedHue)
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 360) {
        setHueState(parsed)
      }
    }
  }, [])

  const setHue = useCallback((val: number) => {
    const clamped = ((val % 360) + 360) % 360
    setHueState(clamped)
    try {
      localStorage.setItem("portfolio_accent_hue", clamped.toString())
    } catch {}
  }, [])

  const colorValues = useMemo(() => {
    const { L: f, a: p, b: m } = sf(hue)
    const accent = Ba(f, p, m)
    const accentVibrant = Ba(f, p * Id, m * Id)
    const accentLight = Ba(Math.min(94, f + 4), p * 1.35, m * 1.35)
    const accentDark = k0(0.6, p * 1.5, m * 1.5)
    return { accent, accentDark, accentVibrant, accentLight }
  }, [hue])

  // Update CSS variables on documentElement
  useEffect(() => {
    if (typeof document === "undefined") return
    const root = document.documentElement
    const isDark = (resolvedTheme || theme) === "dark"

    root.style.setProperty("--accent", colorValues.accent)
    root.style.setProperty("--accent-dark", colorValues.accentDark)
    root.style.setProperty("--accent-vibrant", colorValues.accentVibrant)
    root.style.setProperty(
      "--accent-color",
      isDark ? colorValues.accentDark : colorValues.accentVibrant
    )
    root.style.setProperty(
      "--accent-glow",
      isDark
        ? `color-mix(in oklab, ${colorValues.accentDark} 35%, transparent)`
        : `color-mix(in oklab, ${colorValues.accentVibrant} 25%, transparent)`
    )
  }, [colorValues, resolvedTheme, theme])

  const contextValue = useMemo(
    () => ({
      hue,
      setHue,
      ...colorValues,
      theme: theme || "dark",
      setTheme,
      resolvedTheme: resolvedTheme || "dark"
    }),
    [hue, setHue, colorValues, theme, setTheme, resolvedTheme]
  )

  return (
    <AccentThemeContext.Provider value={contextValue}>
      {children}
    </AccentThemeContext.Provider>
  )
}

export function useAccentTheme() {
  const context = useContext(AccentThemeContext)
  if (!context) {
    throw new Error("useAccentTheme must be used within an AccentThemeProvider")
  }
  return context
}
