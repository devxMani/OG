"use client"

import Image from "next/image"
import { animate, motion, useMotionValue, useTransform } from "motion/react"
import { useCallback, useEffect, useRef, useState } from "react"

const TOP_OFFSET = 10

export default function WindowShutter() {
  const shutterRef = useRef<HTMLDivElement>(null)
  const y = useMotionValue(0)
  const [height, setHeight] = useState(0)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!shutterRef.current) return
    const observer = new ResizeObserver(() => setHeight(shutterRef.current?.offsetHeight ?? 0))
    observer.observe(shutterRef.current)
    setHeight(shutterRef.current.offsetHeight)
    return () => observer.disconnect()
  }, [])

  const topLimit = -(Math.max(height - TOP_OFFSET, 0))
  const progress = useTransform(y, (value) => Math.min(Math.max(-value / Math.max(height - TOP_OFFSET, 1), 0), 1))
  const imageBrightness = useTransform(progress, (value) => `brightness(${0.42 + value * 0.58})`)

  const toggle = useCallback(() => {
    const nextOpen = !open
    setOpen(nextOpen)
    animate(y, nextOpen ? topLimit : 0, { type: "tween", ease: [0.32, 0.72, 0, 1], duration: 0.55 })
    const audio = new Audio("/image/window-shutter/shutter-sound.mp3")
    audio.volume = 0.22
    audio.play().catch(() => undefined)
  }, [open, topLimit, y])

  return (
    <section aria-label="A small window into the experience" className="relative my-6 overflow-hidden py-2 sm:my-8">
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-black"
        animate={{ opacity: open ? 0.01 : 0.08 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      />
      <div className="relative z-[1] mx-auto flex w-full max-w-[360px] flex-col items-center">
        <p className="mb-3 font-newsreader text-sm italic text-foreground/65">a small window into the work</p>
        <div className="relative aspect-[1.28/1] w-full max-w-[270px] overflow-hidden rounded-[2.2rem] bg-foreground/[0.04] shadow-[0_12px_40px_-28px_rgba(0,0,0,0.8)]">
        <motion.div className="absolute inset-[7%] overflow-hidden rounded-[1.5rem]" style={{ filter: imageBrightness }}>
          <video autoPlay loop muted playsInline className="h-full w-full object-cover" aria-label="A train moving past a window">
            <source src="/image/window-shutter/train-video-day.webm" type="video/webm" />
          </video>
        </motion.div>
        <Image src="/image/window-shutter/window-inner-frame.webp" alt="" fill sizes="(max-width: 768px) 100vw, 620px" className="pointer-events-none object-fill" />
        <div ref={shutterRef} className="absolute inset-[9%] overflow-hidden rounded-[1.5rem]">
          <motion.div className="absolute inset-0 cursor-grab active:cursor-grabbing" style={{ y }} drag="y" dragConstraints={{ top: topLimit, bottom: 0 }} dragElastic={0} dragMomentum={false} onTap={toggle} onDragEnd={(_, info) => {
            if (Math.abs(info.offset.y) > height * 0.35 || info.velocity.y < -500) {
              setOpen(true)
              animate(y, topLimit, { type: "tween", duration: 0.55 })
            } else {
              setOpen(false)
              animate(y, 0, { type: "tween", duration: 0.55 })
            }
          }}>
            <Image src="/image/window-shutter/window-shutter.webp" alt="" fill sizes="620px" className="pointer-events-none object-fill" draggable={false} />
          </motion.div>
        </div>
        <Image src="/image/window-shutter/window-outer-frame.webp" alt="" fill sizes="(max-width: 768px) 100vw, 620px" className="pointer-events-none object-fill" />
        </div>
      </div>
    </section>
  )
}
