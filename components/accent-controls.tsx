"use client"

import React, { useRef, useState, useCallback, useEffect } from "react"
import { useAccentTheme } from "@/components/accent-theme-provider"

interface AccentControlsProps {
  embedded?: boolean
}

export function AccentControls({ embedded = false }: AccentControlsProps) {
  const {
    hue,
    setHue,
    accentDark,
    accentVibrant,
    theme,
    setTheme,
    resolvedTheme
  } = useAccentTheme()

  const isDark = (resolvedTheme || theme) === "dark"
  const trackRef = useRef<HTMLDivElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const updateHueFromClientX = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return
      const rect = trackRef.current.getBoundingClientRect()
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
      setHue(Math.round(ratio * 360))
    },
    [setHue]
  )

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true)
    updateHueFromClientX(e.clientX)
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {}
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons !== 0 || isDragging) {
      updateHueFromClientX(e.clientX)
    }
  }

  const handlePointerUp = () => {
    setIsDragging(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault()
      setHue((hue + 4) % 360)
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault()
      setHue((hue + 356) % 360)
    }
  }

  if (!mounted) return null

  const activeColor = isDark ? accentDark : accentVibrant

  return (
    <>
      {/* Desktop Controller */}
      <div
        aria-label="Theme and accent colour controls"
        className={`controls group select-none relative ${
          embedded ? "w-auto" : "hidden"
        }`}
      >
        <div className="relative py-1 w-[196px]">
          {/* Resting State */}
          <div
            className="controls-peek theme-orb ml-auto flex h-10 w-10 items-center justify-center rounded-full glass-control cursor-pointer transition-all duration-200 group-hover:opacity-0 group-hover:pointer-events-none group-focus-within:opacity-0 group-focus-within:pointer-events-none"
            aria-hidden="true"
          >
            <span className="theme-orb-core h-5 w-5 rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.45)]" />
          </div>

          {/* Expanded State (Panel mode) */}
          <div className="controls-panel glass-control absolute right-0 top-0 w-[210px] p-3.5 rounded-2xl flex flex-col gap-3.5 opacity-0 pointer-events-none translate-y-1 transition-all duration-200 ease-out group-hover:opacity-100 group-hover:pointer-events-auto group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 z-50">
            {/* Accent Colour Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[11px] font-normal text-foreground/50">
                <span>Accent Colour</span>
                <span
                  className="w-2 h-2 rounded-full border border-black/10 dark:border-white/10"
                  style={{ backgroundColor: activeColor }}
                />
              </div>

              <div className="accent-track-row flex items-center h-4">
                <div
                  ref={trackRef}
                  role="slider"
                  aria-label="Accent colour slider"
                  aria-valuemin={0}
                  aria-valuemax={360}
                  aria-valuenow={hue}
                  tabIndex={0}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onKeyDown={handleKeyDown}
                  className="accent-track relative flex-1 h-1.5 rounded-full cursor-pointer touch-none outline-none focus-visible:ring-1 focus-visible:ring-white/40"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, #ffaf8c 0.12%, #f9c700 11.59%, #e6d700, #d7e400 23.05%, #b1ef00 29.5%, #8ff700 32.72%, #74fc00 34.33%, #63fe00, #57ff2e 35.94%, #54ff3d, #51ff49, #4eff53 37.15%, #4dff57, #4bff5b 37.55%, #44ff69, #3dff74 39.16%, #05ff95, #01fdae, #00fcc0 48.83%, #00f4d1 55.86%, #00f2d8, #00efe0 59.38%, #00eee5 60.26%, #00ede8, #18ecea 61.14%, #3ce9ee, #50e6f1 62.89%, #85d8ff, #accbff 69.92%, #ccb7ff 76.95%, #fea3da, #ffac9f)",
                    boxShadow: "inset 0 1px 1px rgba(255,255,255,0.3)"
                  }}
                >
                  <span
                    className="accent-knob absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white dark:bg-zinc-800 shadow-sm border border-black/20 dark:border-white/20 flex items-center justify-center pointer-events-none"
                    style={{ left: `${(hue / 360) * 100}%` }}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: activeColor }}
                    />
                  </span>
                </div>
              </div>
            </div>

            {/* Theme Toggle */}
            <div className="flex flex-col gap-1.5 pt-1 border-t border-foreground/10">
              <span className="text-[11px] font-normal text-foreground/50">Theme</span>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  aria-label="Light theme"
                  aria-pressed={!isDark}
                  onClick={() => setTheme("light")}
                  className={`w-3.5 h-3.5 rounded-full cursor-pointer transition-all duration-150 ${
                    !isDark
                      ? "ring-1.5 ring-offset-1 ring-offset-background ring-foreground scale-105"
                      : "opacity-40 hover:opacity-80"
                  }`}
                  style={{ backgroundColor: "#f4f4f5" }}
                />

                <button
                  type="button"
                  aria-label="Dark theme"
                  aria-pressed={isDark}
                  onClick={() => setTheme("dark")}
                  className={`w-3.5 h-3.5 rounded-full cursor-pointer transition-all duration-150 ${
                    isDark
                      ? "ring-1.5 ring-offset-1 ring-offset-background ring-foreground scale-105"
                      : "opacity-40 hover:opacity-80"
                  }`}
                  style={{ backgroundColor: "#27272a" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Floating Button */}
      {!embedded && (
        <div className="md:hidden fixed bottom-5 left-5 z-40">
          <button
            type="button"
            onClick={() => setIsMobileOpen((prev) => !prev)}
            aria-label="Open theme and accent colour settings"
            className="h-10 w-10 rounded-full glass-control theme-orb flex items-center justify-center p-0"
            data-cuelume-press="tick"
          >
            <span
              className="w-3.5 h-3.5 rounded-full border border-black/20 dark:border-white/20"
              style={{ backgroundColor: activeColor }}
            />
          </button>

          {isMobileOpen && (
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
              onClick={() => setIsMobileOpen(false)}
            >
              <div
                className="fixed bottom-0 inset-x-0 p-6 bg-background/95 backdrop-blur-2xl border-t border-white/10 rounded-t-2xl shadow-2xl flex flex-col gap-5"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-8 h-1 rounded-full bg-muted-foreground/30 mx-auto" />

                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold">Theme & Accent</h3>
                  <button
                    type="button"
                    onClick={() => setIsMobileOpen(false)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Done
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Accent Colour</span>
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: activeColor }}
                    />
                  </div>
                  <div
                    ref={trackRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    className="relative h-3 rounded-full cursor-pointer touch-none"
                    style={{
                      backgroundImage:
                        "linear-gradient(90deg, #ffaf8c 0.12%, #f9c700 11.59%, #e6d700, #d7e400 23.05%, #b1ef00 29.5%, #8ff700 32.72%, #74fc00 34.33%, #63fe00, #57ff2e 35.94%, #54ff3d, #51ff49, #4eff53 37.15%, #4dff57, #4bff5b 37.55%, #44ff69, #3dff74 39.16%, #05ff95, #01fdae, #00fcc0 48.83%, #00f4d1 55.86%, #00f2d8, #00efe0 59.38%, #00eee5 60.26%, #00ede8, #18ecea 61.14%, #3ce9ee, #50e6f1 62.89%, #85d8ff, #accbff 69.92%, #ccb7ff 76.95%, #fea3da, #ffac9f)"
                    }}
                  >
                    <span
                      className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white dark:bg-zinc-800 shadow-sm border border-black/20 flex items-center justify-center"
                      style={{ left: `${(hue / 360) * 100}%` }}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: activeColor }}
                      />
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-xs text-muted-foreground">Mode</span>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setTheme("light")}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        !isDark
                          ? "bg-foreground text-background border-foreground"
                          : "bg-muted/40 text-muted-foreground border-transparent"
                      }`}
                    >
                      Light
                    </button>
                    <button
                      type="button"
                      onClick={() => setTheme("dark")}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        isDark
                          ? "bg-foreground text-background border-foreground"
                          : "bg-muted/40 text-muted-foreground border-transparent"
                      }`}
                    >
                      Dark
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
