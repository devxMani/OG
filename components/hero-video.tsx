"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronRight, Volume2, VolumeX, Music, Headphones } from "lucide-react"

// ─── video clips ─────────────────────────────────────────────────────────────
// Added: breeze.mp4 → /hero/breeze.mp4
//         village.mp4 → /hero/village.mp4
//         everything.mp4 → /hero/everything.mp4
// Copy the three uploaded files into your /public/hero/ folder.
const CLIPS = [
  { src: "/hero/one-of-those-evenings.mp4",          label: "Sunset Drive"                    },
  { src: "/hero/breeze.mp4",                         label: "A Light Breeze"                  },
  { src: "/hero/village.mp4",                        label: "The Village"                     },
  { src: "/hero/everything.mp4",                     label: "Everything Reacts"               },
  { src: "/hero/one-last-check.mp4",                 label: "One Last Check"                  },
  { src: "/hero/still-counts-as-indoors.mp4",        label: "Still Counts as Indoors"         },
  { src: "/hero/could-leave-anytime.mp4",            label: "Could Leave Anytime"             },
  { src: "/hero/breeze-tomatoes.mp4",                label: "The Tomatoes Still Need Water"   },
  { src: "/hero/time-isnt-always-meant-to-move.mp4", label: "Time Isn't Always Meant to Move" },
] as const

// ─── audio ───────────────────────────────────────────────────────────────────
// on-my-way.mp4 is placed at /public/hero/on-my-way.mp4
// It plays automatically on the very first user gesture (browser policy).
// The Headphones button icon shows it is active on load.
// piano.mp3 starts OFF and must be toggled on manually.

const PIANO_KEY     = "mani:piano"      // persisted piano pref
const ON_MY_WAY_KEY = "mani:on-my-way"  // persisted omw pref

const btn =
  "flex h-7 w-7 items-center justify-center rounded-full " +
  "bg-black/25 text-foreground/55 backdrop-blur-md " +
  "border border-white/[0.07] transition-colors " +
  "hover:bg-black/40 hover:text-foreground/90"

export function HeroVideo() {
  const videoRef    = useRef<HTMLVideoElement>(null)
  const videoRefs   = useRef<Array<HTMLVideoElement | null>>([])
  const pianoRef    = useRef<HTMLAudioElement>(null)
  const onMyWayRef  = useRef<HTMLAudioElement>(null)

  const [activeClip,    setActiveClip]    = useState(0)
  const [videoMuted,    setVideoMuted]    = useState(true)
  const [reducedMotion, setReducedMotion] = useState(false)

  // on-my-way is ON by default unless user explicitly turned it off before
  // piano is OFF by default unless user explicitly turned it on before
  const [onMyWayOn, setOnMyWayOn] = useState(true)
  const [pianoOn,   setPianoOn]   = useState(false)

  // ── reduced-motion ──────────────────────────────────────────────────────────
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReducedMotion(mql.matches)
    const h = () => setReducedMotion(mql.matches)
    mql.addEventListener("change", h)
    return () => mql.removeEventListener("change", h)
  }, [])

  // ── restore saved prefs on mount ────────────────────────────────────────────
  useEffect(() => {
    try {
      // on-my-way: default ON — only off if user explicitly saved "off"
      const savedOmw = window.localStorage.getItem(ON_MY_WAY_KEY)
      setOnMyWayOn(savedOmw !== "off")
      // piano: default OFF — only on if user explicitly saved "on"
      const savedPiano = window.localStorage.getItem(PIANO_KEY)
      setPianoOn(savedPiano === "on")
    } catch { /* ignore */ }
  }, [])

  // ── play active video clip ──────────────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = videoMuted
    if (reducedMotion) { video.pause(); return }
    void video.play().catch(() => {})
  }, [activeClip, videoMuted, reducedMotion])

  // ─── audio helper ───────────────────────────────────────────────────────────
  // Tries to play immediately; if blocked by browser autoplay policy,
  // queues up to fire on the very next user gesture (pointer or key).
  const startAudio = (audio: HTMLAudioElement) => {
    const tryPlay = () => void audio.play().catch(() => {})
    tryPlay()
    const onGesture = () => {
      tryPlay()
      window.removeEventListener("pointerdown", onGesture)
      window.removeEventListener("keydown",     onGesture)
    }
    window.addEventListener("pointerdown", onGesture, { once: true, passive: true })
    window.addEventListener("keydown",     onGesture, { once: true, passive: true })
    return () => {
      window.removeEventListener("pointerdown", onGesture)
      window.removeEventListener("keydown",     onGesture)
    }
  }

  // ── "On My Way" track (default ON) ─────────────────────────────────────────
  useEffect(() => {
    const audio = onMyWayRef.current
    if (!audio) return
    audio.loop   = true
    audio.volume = 0.55
    let cleanup: (() => void) | undefined
    if (onMyWayOn) {
      if (pianoRef.current) pianoRef.current.pause()  // only one at a time
      cleanup = startAudio(audio)
    } else {
      audio.pause()
    }
    try { window.localStorage.setItem(ON_MY_WAY_KEY, onMyWayOn ? "on" : "off") } catch {}
    return cleanup
  }, [onMyWayOn]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── piano track (default OFF) ───────────────────────────────────────────────
  useEffect(() => {
    const audio = pianoRef.current
    if (!audio) return
    audio.loop   = true
    audio.volume = 0.42
    let cleanup: (() => void) | undefined
    if (pianoOn) {
      if (onMyWayRef.current) onMyWayRef.current.pause()  // only one at a time
      cleanup = startAudio(audio)
    } else {
      audio.pause()
    }
    try { window.localStorage.setItem(PIANO_KEY, pianoOn ? "on" : "off") } catch {}
    return cleanup
  }, [pianoOn]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleOnMyWay = () => {
    if (!onMyWayOn) setPianoOn(false)   // turning omw on → kill piano
    setOnMyWayOn((v) => !v)
  }
  const togglePiano = () => {
    if (!pianoOn) setOnMyWayOn(false)   // turning piano on → kill omw
    setPianoOn((v) => !v)
  }

  const nextClip = () => setActiveClip((i) => (i + 1) % CLIPS.length)

  return (
    <figure className="relative m-0 w-full overflow-hidden rounded-[10px]">
      {/* audio elements */}
      <audio ref={onMyWayRef} src="/hero/on-my-way.mp4" preload="none" loop />
      <audio ref={pianoRef}   src="/hero/piano.mp3"     preload="none" loop />

      <div className="relative aspect-[21/9] w-full max-h-[380px] bg-black/40">

        {/* blurred ambient layer */}
        {!reducedMotion && (
          <video
            key={`blur-${CLIPS[activeClip].src}`}
            className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-30 blur-2xl"
            src={CLIPS[activeClip].src}
            autoPlay muted loop playsInline preload="none"
            aria-hidden="true"
          />
        )}

        {/* main clips */}
        {CLIPS.map((clip, index) => {
          const isActive = index === activeClip
          const isNext   = index === (activeClip + 1) % CLIPS.length
          if (!isActive && !isNext) return null
          return (
            <video
              key={clip.src}
              ref={(el) => {
                videoRefs.current[index] = el
                if (isActive) videoRef.current = el
              }}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
                isActive ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
              autoPlay={isActive && !reducedMotion}
              muted={videoMuted}
              loop playsInline
              preload={isActive ? "metadata" : "none"}
              src={clip.src}
              onLoadedData={() => {
                if (isActive) void videoRefs.current[index]?.play().catch(() => {})
              }}
              aria-hidden={!isActive}
              aria-label={isActive ? clip.label : undefined}
            />
          )
        })}

        {/* gradient foot */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/70 to-transparent" />

        {/* controls — bottom right */}
        <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5">
          <button type="button" onClick={nextClip}
            aria-label={`Next clip — ${CLIPS[activeClip].label}`}
            className={btn} data-cuelume-toggle="tick">
            <ChevronRight className="h-3.5 w-3.5" />
          </button>

          <button type="button" onClick={() => setVideoMuted((v) => !v)}
            aria-label={videoMuted ? "Unmute clip" : "Mute clip"}
            aria-pressed={!videoMuted} className={btn} data-cuelume-toggle="tick">
            {videoMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </button>

          {/* Piano — starts off, icon dim */}
          <button type="button" onClick={togglePiano}
            aria-label={pianoOn ? "Turn piano off" : "Turn piano on"}
            aria-pressed={pianoOn} className={btn} data-cuelume-toggle="tick">
            <Music className={`h-3.5 w-3.5 ${pianoOn ? "" : "opacity-35"}`} />
          </button>

          {/* On My Way — starts ON, icon bright */}
          <button type="button" onClick={toggleOnMyWay}
            aria-label={onMyWayOn ? "Stop 'On My Way'" : "Play 'On My Way'"}
            aria-pressed={onMyWayOn} className={btn} data-cuelume-toggle="tick">
            <Headphones className={`h-3.5 w-3.5 ${onMyWayOn ? "" : "opacity-35"}`} />
          </button>
        </div>
      </div>

      {/* caption */}
      <figcaption className="mt-2.5 flex items-baseline justify-between text-[10px] uppercase tracking-[0.22em] text-foreground/35">
        <span>{CLIPS[activeClip].label}</span>
        <span>
          {String(activeClip + 1).padStart(2, "0")} / {String(CLIPS.length).padStart(2, "0")}
        </span>
      </figcaption>
    </figure>
  )
}