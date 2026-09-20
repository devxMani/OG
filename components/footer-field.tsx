"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Ambient green field behind the footer. Procedurally generated caustics,
 * 960x540, ~380KB, no audio, edges feathered in CSS so it melts into the page
 * rather than sitting in a box. Only starts playing once it scrolls into view,
 * so it costs nothing until someone reaches the bottom.
 */
export function FooterField() {
  const ref = useRef<HTMLVideoElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const video = ref.current
    if (!video) return

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting)
        if (entry.isIntersecting) {
          void video.play().catch(() => {})
        } else {
          video.pause()
        }
      },
      { rootMargin: "200px" }
    )

    observer.observe(video)
    return () => observer.disconnect()
  }, [])

  return (
    <div aria-hidden className="pointer-events-none relative mt-24 h-[260px] w-full overflow-hidden sm:h-[320px]">
      <video
        ref={ref}
        className="video-feather--soft absolute inset-0 h-full w-full object-cover opacity-[0.55] transition-opacity duration-700"
        style={{ opacity: inView ? undefined : 0.2 }}
        src="/hero/footer-field.mp4"
        poster="/hero/footer-poster.jpg"
        muted
        loop
        playsInline
        preload="none"
      />
      {/* tie it back into the page background at top and bottom */}
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </div>
  )
}

export default FooterField