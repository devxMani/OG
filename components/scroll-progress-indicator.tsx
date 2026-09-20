"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from "framer-motion"
import { cn } from "@/lib/utils"

export type ScrollProgressSection = { id: string; label: string }

type ScrollProgressIndicatorProps = {
  sections: ScrollProgressSection[]
  className?: string
}

export function ScrollProgressIndicator({ sections, className }: ScrollProgressIndicatorProps) {
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 })
  const [activeId, setActiveId] = React.useState(sections[0]?.id)
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const updateActive = () => {
      const anchor = window.innerHeight * 0.28
      const active = [...sections].reverse().find(({ id }) => {
        const element = document.getElementById(id)
        return element && element.getBoundingClientRect().top <= anchor
      })
      setActiveId(active?.id ?? sections[0]?.id)
    }
    updateActive()
    window.addEventListener("scroll", updateActive, { passive: true })
    window.addEventListener("resize", updateActive)
    return () => {
      window.removeEventListener("scroll", updateActive)
      window.removeEventListener("resize", updateActive)
    }
  }, [sections])

  React.useEffect(() => {
    if (!open) return
    const close = (event: PointerEvent) => {
      if (!(event.target as HTMLElement).closest("[data-scroll-progress]")) setOpen(false)
    }
    const escape = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false)
    document.addEventListener("pointerdown", close)
    document.addEventListener("keydown", escape)
    return () => {
      document.removeEventListener("pointerdown", close)
      document.removeEventListener("keydown", escape)
    }
  }, [open])

  const activeLabel = sections.find((section) => section.id === activeId)?.label
  const scrollTo = (id: string) => {
    setActiveId(id)
    setOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" })
  }

  return (
    <div data-scroll-progress className={cn("fixed bottom-5 left-1/2 z-40 -translate-x-1/2", className)}>
      <motion.div
        layout
        transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 180, damping: 24 }}
        className="overflow-hidden rounded-full border border-foreground/15 bg-background/65 shadow-lg backdrop-blur-xl"
      >
        <AnimatePresence initial={false} mode="wait">
          {open ? (
            <motion.div key="menu" initial={{ opacity: 0, filter: "blur(6px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} exit={{ opacity: 0, filter: "blur(6px)" }} className="flex items-center gap-1 p-1">
              {sections.map((section) => (
                <button key={section.id} type="button" onClick={() => scrollTo(section.id)} className={cn("rounded-full px-3 py-1.5 font-newsreader text-xs transition-colors", activeId === section.id ? "bg-foreground/10 text-foreground" : "text-muted-foreground hover:text-foreground")}>
                  {section.label}
                </button>
              ))}
            </motion.div>
          ) : (
            <motion.button key="pill" type="button" onClick={() => setOpen(true)} initial={{ opacity: 0, filter: "blur(5px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} exit={{ opacity: 0, filter: "blur(5px)" }} className="flex items-center gap-2 px-3 py-2 font-newsreader text-xs text-foreground/75">
              <svg viewBox="0 0 24 24" className="size-4 -rotate-90" aria-hidden="true">
                <circle cx="12" cy="12" r="9" fill="none" className="stroke-foreground/15" strokeWidth="2.5" />
                <motion.circle cx="12" cy="12" r="9" fill="none" className="stroke-foreground/75" strokeWidth="2.5" strokeLinecap="round" style={{ pathLength: progress }} />
              </svg>
              <span>{activeLabel}</span>
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
