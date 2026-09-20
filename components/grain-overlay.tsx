"use client"

import { useEffect, useState } from "react"

const TILE = 140

/**
 * Film grain, the cheap way.
 *
 * The old version repainted a full-viewport ImageData buffer (~8M writes on a
 * 1440p screen) on mount and again on every resize. This paints ONE 140x140
 * noise tile to an offscreen canvas, hands it to CSS as a repeating
 * background, and lets a steps() animation jitter it. After the first frame it
 * costs nothing: no canvas in the DOM, no JS on resize, no per-frame work.
 */
export function GrainOverlay({ opacity = 0.13 }: { opacity?: number }) {
  const [tile, setTile] = useState<string | null>(null)

  useEffect(() => {
    const canvas = document.createElement("canvas")
    canvas.width = TILE
    canvas.height = TILE
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const image = ctx.createImageData(TILE, TILE)
    const data = image.data

    for (let i = 0; i < data.length; i += 4) {
      // Monochrome noise biased toward mid-grey, so it reads as film texture
      // rather than salt-and-pepper speckle.
      const value = 110 + ((Math.random() * 145) | 0)
      data[i] = value
      data[i + 1] = value
      data[i + 2] = value
      data[i + 3] = 255
    }

    ctx.putImageData(image, 0, 0)
    setTile(canvas.toDataURL("image/png"))
  }, [])

  if (!tile) return null

  return (
    <div
      aria-hidden
      className="film-grain mix-blend-soft-light"
      style={{ backgroundImage: `url(${tile})`, opacity }}
    />
  )
}

export default GrainOverlay