"use client"

import { useEffect, useRef, useState } from "react"
import { Volume2, VolumeX, SkipForward, Music } from "lucide-react"

const CLIPS = [
  { src: "/hero/x.mp4", label: "X" },
  { src: "/hero/one-last-check.mp4", label: "One last check before heading home" },
  { src: "/hero/everything-reacts.mp4", label: "Everything reacts" },
  { src: "/hero/shouldve-done-this-yesterday.mp4", label: "Should've done this yesterday" },
  { src: "/hero/still-counts-as-indoors.mp4", label: "Still counts as indoors" },
  { src: "/hero/one-of-those-evenings.mp4", label: "One of those evenings" },
  { src: "/hero/could-leave-anytime.mp4", label: "Could leave anytime, still here" },
  { src: "/hero/time-isnt-always-meant-to-move.mp4", label: "Time isn't always meant to move" },
] as const

const controlClassName =
  "flex h-8 w-8 items-center justify-center rounded-full border border-border/50 bg-background/55 text-foreground/80 backdrop-blur-sm transition-colors hover:bg-background/80 hover:text-foreground"

export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [index, setIndex] = useState(0)
  const [videoMuted, setVideoMuted] = useState(false)
  const [musicOff, setMusicOff] = useState(false)
  const clip = CLIPS[index]

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    const syncPlayback = () => {
      video.muted = videoMuted
      video.volume = videoMuted ? 0 : 1
      if (media.matches) {
        video.pause()
        return
      }
      void video.play().catch(() => {})
    }

    syncPlayback()
    media.addEventListener("change", syncPlayback)
    return () => media.removeEventListener("change", syncPlayback)
  }, [index, videoMuted])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.loop = true
    audio.volume = 0.55

    const playPiano = () => {
      if (musicOff) {
        audio.pause()
        return
      }
      void audio.play().catch(() => {})
    }

    playPiano()

    const startOnGesture = () => {
      playPiano()
      window.removeEventListener("pointerdown", startOnGesture)
      window.removeEventListener("keydown", startOnGesture)
    }

    if (!musicOff) {
      window.addEventListener("pointerdown", startOnGesture)
      window.addEventListener("keydown", startOnGesture)
    }

    return () => {
      window.removeEventListener("pointerdown", startOnGesture)
      window.removeEventListener("keydown", startOnGesture)
    }
  }, [musicOff])

  const nextClip = () => {
    setIndex((current) => (current + 1) % CLIPS.length)
  }

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-border/40 bg-muted">
      <audio ref={audioRef} src="/hero/piano.mp3" preload="auto" loop />
      <div className="relative aspect-[16/7] min-h-[168px] w-full max-h-[340px] sm:max-h-[400px]">
        <video
          key={clip.src}
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted={videoMuted}
          loop
          playsInline
          preload="auto"
          src={clip.src}
          aria-label={clip.label}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent" />

        <div className="absolute right-3 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-1.5">
          <button type="button" onClick={nextClip} aria-label="Next video" className={controlClassName}>
            <SkipForward className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setVideoMuted((value) => !value)}
            aria-label={videoMuted ? "Turn video audio on" : "Turn video audio off"}
            className={controlClassName}
          >
            {videoMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => setMusicOff((value) => !value)}
            aria-label={musicOff ? "Turn music on" : "Turn music off"}
            className={controlClassName}
          >
            <Music className={`h-3.5 w-3.5 ${musicOff ? "opacity-40" : ""}`} />
          </button>
        </div>
      </div>
    </div>
  )
}
