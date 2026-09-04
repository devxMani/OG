"use client"

import { useEffect, useRef } from "react"

export function GrainOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const draw = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      const image = ctx.createImageData(canvas.width, canvas.height)
      const data = image.data

      for (let i = 0; i < data.length; i += 4) {
        const value = (Math.random() * 255) | 0
        data[i] = value
        data[i + 1] = value
        data[i + 2] = value
        data[i + 3] = 255
      }

      ctx.putImageData(image, 0, 0)
    }

    draw()
    window.addEventListener("resize", draw)

    return () => {
      window.removeEventListener("resize", draw)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[9999]"
      style={{ opacity: 0.055 }}
    />
  )
}
