"use client"

import { useEffect, useState } from "react"

interface SiteFooterProps {
  lastUpdated: string
}

function LiveClock() {
  const [time, setTime] = useState<string>("")

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      const h = String(now.getHours()).padStart(2, "0")
      const m = String(now.getMinutes()).padStart(2, "0")
      const s = String(now.getSeconds()).padStart(2, "0")
      setTime(`${h}:${m}:${s}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return <span className="font-mono tabular-nums tracking-wider">{time}</span>
}

export function SiteFooter({ lastUpdated }: SiteFooterProps) {
  return (
    <footer className="mt-16 pt-6 border-t border-foreground/[0.05]">
      {/* matches reference: "peace out" left, clock right, both very dim */}
      <div className="flex items-center justify-between">
        <span className="text-[13px] text-foreground/25 font-newsreader italic">
          peace out
        </span>
        <span className="text-[12px] text-foreground/22 font-mono tabular-nums">
          <LiveClock />
        </span>
      </div>

      {/* last updated — one step dimmer */}
      <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-foreground/15">
        last updated {lastUpdated}
      </p>
    </footer>
  )
}