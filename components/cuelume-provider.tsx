"use client"

import { useEffect } from "react"
import { bind, setVolume } from "cuelume"

export function CuelumeProvider() {
  useEffect(() => {
    setVolume(0.6)
    bind()
  }, [])

  return null
}
