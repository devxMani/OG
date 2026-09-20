"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronRight, Volume2, VolumeX, Music, Disc3 } from "lucide-react"

const CLIPS = [
  { src: "/hero/one-of-those-evenings.mp4", label: "Sunset Drive" },
  { src: "/hero/one-last-check.mp4", label: "One Last Check" },
  { src: "/hero/still-counts-as-indoors.mp4", label: "Still Counts as Indoors" },
  { src: "/hero/could-leave-anytime.mp4", label: "Could Leave Anytime" },
  { src: "/hero/breeze-tomatoes.mp4", label: "The Tomatoes Still Need Water" },
  { src: "/hero/time-isnt-always-meant-to-move.mp4", label: "Time Isn't Always Meant to Move" },
] as const

const TRACKS = [
  { id: "piano", src: "/hero/piano.mp3", label: "Piano" },
  { id: "onmyway", src: "/hero/on-my-way.m4a", label: "On My Way" },
] as const

type TrackId = (typeof TRACKS)[number]["id"]

const MUSIC_KEY = "mani:music"

const controlClassName =
  "flex h-7 w-7 items-center justify-center rounded-full bg-black/30 text-foreground/55 backdrop-blur-md border border-white/[0.07] transition-colors hover:bg-black/50 hover:text-foreground/90"

const activeControlClassName =
  "flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.16] text-foreground backdrop-blur-md border border-white/[0.18] transition-colors"

export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [activeClip, setActiveClip] = useState(0)
  const [videoMuted, setVideoMuted] = useState(true)
  // Sound is opt-in. `null` means silence.
  const [track, setTrack] = useState<TrackId | null>(null)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReducedMotion(media.matches)
    const onChange = () => setReducedMotion(media.matches)
    media.addEventListener("change", onChange)
    return () => media.removeEventListener("change", onChange)
  }, [])

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(MUSIC_KEY)
      if (saved && TRACKS.some((entry) => entry.id === saved)) setTrack(saved as TrackId)
    } catch {
      /* storage unavailable, stay silent */
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = videoMuted
    if (reducedMotion) {
      video.pause()
      return
    }
    void video.play().catch(() => {})
  }, [activeClip, videoMuted, reducedMotion])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.loop = true
    audio.volume = 0.45

    if (track) {
      void audio.play().catch(() => {})
    } else {
      audio.pause()
    }

    try {
      window.localStorage.setItem(MUSIC_KEY, track ?? "off")
    } catch {
      /* no-op */
    }
  }, [track])

  const nextClip = () => setActiveClip((index) => (index + 1) % CLIPS.length)

  // Selecting the playing track turns it off; selecting the other switches.
  const toggleTrack = (id: TrackId) => setTrack((current) => (current === id ? null : id))

  const currentTrack = TRACKS.find((entry) => entry.id === track)

  return (
    <figure className="relative w-full m-0">
      <audio
        ref={audioRef}
        key={currentTrack?.src ?? "silent"}
        src={currentTrack?.src}
        preload="none"
        loop
      />

      {/* video-feather masks the edges so the frame dissolves into the page
          instead of ending on a hard rectangle */}
      <div className="video-feather relative aspect-[21/9] w-full max-h-[420px]">
        <video
          ref={videoRef}
          key={CLIPS[activeClip].src}
          className="absolute inset-0 h-full w-full object-cover"
          src={CLIPS[activeClip].src}
          poster="/hero/poster.jpg"
          autoPlay={!reducedMotion}
          muted={videoMuted}
          loop
          playsInline
          preload="metadata"
          aria-label={CLIPS[activeClip].label}
        />
      </div>

      <div className="absolute right-6 bottom-6 z-10 flex items-center gap-1.5">
        <button
          type="button"
          onClick={nextClip}
          aria-label={`Next clip. Now playing ${CLIPS[activeClip].label}`}
          className={controlClassName}
          data-cuelume-toggle="tick"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setVideoMuted((value) => !value)}
          aria-label={videoMuted ? "Unmute clip audio" : "Mute clip audio"}
          aria-pressed={!videoMuted}
          className={controlClassName}
          data-cuelume-toggle="tick"
        >
          {videoMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
        </button>
        <button
          type="button"
          onClick={() => toggleTrack("piano")}
          aria-label={track === "piano" ? "Stop Piano" : "Play Piano"}
          aria-pressed={track === "piano"}
          className={track === "piano" ? activeControlClassName : controlClassName}
          data-cuelume-toggle="tick"
        >
          <Music className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => toggleTrack("onmyway")}
          aria-label={track === "onmyway" ? "Stop On My Way" : "Play On My Way"}
          aria-pressed={track === "onmyway"}
          className={track === "onmyway" ? activeControlClassName : controlClassName}
          data-cuelume-toggle="tick"
        >
          <Disc3 className="h-3.5 w-3.5" />
        </button>
      </div>

      <figcaption className="mt-3 flex items-baseline justify-between px-2 text-[11px] uppercase tracking-[0.22em] text-foreground/35">
        <span>{CLIPS[activeClip].label}</span>
        <span>
          {currentTrack ? `♪ ${currentTrack.label}` : ""}
          <span className="ml-4">
            {String(activeClip + 1).padStart(2, "0")} / {String(CLIPS.length).padStart(2, "0")}
          </span>
        </span>
      </figcaption>
    </figure>
  )
}