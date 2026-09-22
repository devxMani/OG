"use client"

import React, { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { useAccentTheme } from "@/components/accent-theme-provider"

const GrainGradient = dynamic(
  () => import("@paper-design/shaders-react").then((m) => m.GrainGradient),
  { ssr: false }
)
const Dithering = dynamic(
  () => import("@paper-design/shaders-react").then((m) => m.Dithering),
  { ssr: false }
)

const RIPPLE_SPEED      = 0.58
const RIPPLE_LIFE       = 850
const RIPPLE_WAVELENGTH = 44
const MAX_RIPPLES       = 12

interface WaterRipple { x: number; y: number; start: number; life: number }

export function PaperBackground() {
  const { accentDark, accentVibrant, resolvedTheme, theme } = useAccentTheme()
  const isDark = (resolvedTheme || theme) === "dark"

  const [mounted,         setMounted]         = useState(false)
  const [windowDim,       setWindowDim]       = useState({ w: 1440, h: 900 })
  const [isReducedMotion, setIsReducedMotion] = useState(false)
  const [pointerOffset,   setPointerOffset]   = useState({ x: 0.14, y: 0.45 })

  const targetOffset    = useRef({ x: 0.14, y: 0.45 })
  const currentOffset   = useRef({ x: 0.14, y: 0.45 })
  const ripplesRef      = useRef<WaterRipple[]>([])
  const rippleCanvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    setMounted(true)
    setWindowDim({ w: window.innerWidth, h: window.innerHeight })
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)")
    setIsReducedMotion(mql.matches)
    const onMotion = () => setIsReducedMotion(mql.matches)
    mql.addEventListener("change", onMotion)
    const onResize = () => setWindowDim({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener("resize", onResize)
    return () => {
      mql.removeEventListener("change", onMotion)
      window.removeEventListener("resize", onResize)
    }
  }, [])

  useEffect(() => {
    if (!mounted || isReducedMotion) return
    const onMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth)  * 2 - 1
      const ny = (e.clientY / window.innerHeight) * 2 - 1
      targetOffset.current = { x: 0.14 + nx * 0.02, y: 0.45 + ny * 0.02 }
    }
    const onDown = (e: PointerEvent) => {
      ripplesRef.current.push({ x: e.clientX, y: e.clientY, start: performance.now(), life: RIPPLE_LIFE })
      if (ripplesRef.current.length > MAX_RIPPLES) ripplesRef.current.shift()
    }
    window.addEventListener("pointermove", onMove, { passive: true })
    window.addEventListener("pointerdown", onDown, { passive: true })
    let rafId = 0
    const lerp = () => {
      const cur = currentOffset.current
      const tgt = targetOffset.current
      cur.x += (tgt.x - cur.x) * 0.04
      cur.y += (tgt.y - cur.y) * 0.04
      const rx = Math.round(cur.x * 1000) / 1000
      const ry = Math.round(cur.y * 1000) / 1000
      if (rx !== pointerOffset.x || ry !== pointerOffset.y) setPointerOffset({ x: rx, y: ry })
      rafId = requestAnimationFrame(lerp)
    }
    rafId = requestAnimationFrame(lerp)
    return () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerdown", onDown)
      cancelAnimationFrame(rafId)
    }
  }, [mounted, isReducedMotion, pointerOffset])

  useEffect(() => {
    if (!mounted) return
    const canvas = rippleCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    let raf = 0
    const render = () => {
      const now = performance.now()
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      const w   = window.innerWidth
      const h   = window.innerHeight
      if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
        canvas.width  = Math.floor(w * dpr)
        canvas.height = Math.floor(h * dpr)
      }
      ctx.save()
      ctx.scale(dpr, dpr)
      ctx.clearRect(0, 0, w, h)
      ripplesRef.current = ripplesRef.current.filter((r) => now - r.start < r.life)
      ripplesRef.current.forEach((r) => {
        const elapsed  = now - r.start
        const t        = elapsed / r.life
        const front    = 12 + elapsed * RIPPLE_SPEED
        const ageAmp   = Math.pow(Math.max(0, 1 - t), 1.5)
        for (let wave = 0; wave < 3; wave++) {
          const ringDist   = front - wave * (RIPPLE_WAVELENGTH * 0.5)
          if (ringDist < 2) continue
          const radialFall = Math.min(1, 120 / ringDist)
          const alpha      = ageAmp * radialFall * (0.16 / (wave + 1))
          ctx.beginPath()
          ctx.arc(r.x, r.y, ringDist, 0, Math.PI * 2)
          ctx.strokeStyle = isDark ? `rgba(255,255,255,${alpha})` : `rgba(255,255,255,${alpha * 1.5})`
          ctx.lineWidth = Math.max(1, 4 - wave)
          ctx.stroke()
          ctx.beginPath()
          ctx.arc(r.x, r.y, Math.max(1, ringDist - 3), 0, Math.PI * 2)
          ctx.strokeStyle = isDark ? `rgba(0,0,0,${alpha * 1.2})` : `rgba(0,0,0,${alpha * 0.8})`
          ctx.lineWidth = 2
          ctx.stroke()
        }
      })
      ctx.restore()
      raf = requestAnimationFrame(render)
    }
    raf = requestAnimationFrame(render)
    return () => cancelAnimationFrame(raf)
  }, [mounted, isDark])

  if (!mounted) {
    return (
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{ backgroundColor: isDark ? "#090909" : "#fdfdfd" }}
      />
    )
  }

  const maxPixels = Math.ceil(windowDim.w * windowDim.h * 1.5 * 1.5)

  return (
    <div className="paper-shader-container fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {isDark ? (
        <>
          {/* ── solid dark base ── */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundColor: "#090909",
              backgroundImage:
                `radial-gradient(90% 70% at 22% 18%, ${accentDark}1f 0%, transparent 60%), ` +
                `radial-gradient(100% 80% at 78% 88%, #5377A41f 0%, transparent 65%)`,
            }}
          />

          {/* ── GRAIN: full intensity across the entire canvas ── */}
          <div className="absolute inset-0 pointer-events-none">
            <GrainGradient
              className="w-full h-full block"
              minPixelRatio={1}
              maxPixelCount={maxPixels}
              speed={isReducedMotion ? 0 : 0.12}
              scale={3.25}
              rotation={0}
              offsetX={pointerOffset.x}
              offsetY={pointerOffset.y}
              softness={1}
              intensity={0.42}
              noise={0.08}
              shape="wave"
              colors={[accentDark, "#5377A4", "#0B0B0B"]}
              colorBack="#00000000"
              style={{ backgroundColor: "transparent" }}
            />
          </div>

          {/*
            ── TEXT-AREA SCRIM ──────────────────────────────────────────────────
            A centre-strip vignette that darkens the grain ONLY where the content
            column sits (~max-w-[56rem] = ~896px, with a 152px left nav column).
            Left side (nav) and right side (empty margin) stay fully grainy.
            On mobile the whole strip darkens since there's no two-column layout.
          */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `
                radial-gradient(
                  ellipse 55% 90% at 58% 50%,
                  rgba(9,9,9,0.72) 0%,
                  rgba(9,9,9,0.38) 55%,
                  transparent 100%
                )
              `,
            }}
          />
        </>
      ) : (
        <>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundColor: "#fcfcfc",
              backgroundImage: `linear-gradient(180deg, #ffffff 0%, color-mix(in oklab, ${accentVibrant} 8%, #ffffff) 65%, #f4f4f5 100%)`,
            }}
          />
          <div className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-60">
            <Dithering
              className="w-full h-full block"
              minPixelRatio={1}
              maxPixelCount={maxPixels}
              speed={isReducedMotion ? 0 : 0.15}
              shape="wave"
              type="4x4"
              size={8}
              scale={1}
              offsetX={pointerOffset.x}
              offsetY={pointerOffset.y}
              colorBack="#00000000"
              colorFront="#D4D4D8"
              style={{ backgroundColor: "transparent" }}
            />
          </div>
          {/* light-mode text scrim */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 55% 90% at 58% 50%, rgba(252,252,252,0.65) 0%, rgba(252,252,252,0.25) 55%, transparent 100%)`,
            }}
          />
        </>
      )}

      {/* water ripple canvas */}
      <canvas
        ref={rippleCanvasRef}
        className="absolute inset-0 pointer-events-none z-[1]"
        aria-hidden="true"
      />
    </div>
  )
}