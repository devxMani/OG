"use client"

import { useEffect, useRef, useState } from "react"
import { Volume2, VolumeX, SkipForward, Music } from "lucide-react"

const CLIPS = [
  { src: "/videeoo.mp4", label: "Bus" },
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
  "flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.06] text-foreground/50 backdrop-blur-xl border border-white/[0.08] transition-all hover:bg-white/[0.12] hover:text-foreground/80"

export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [index, setIndex] = useState(0)
  const [videoMuted, setVideoMuted] = useState(false)
  const [musicOff, setMusicOff] = useState(false)
  const clip = CLIPS[index]
  const isOpeningClip = index === 0
  const shouldMuteVideo = isOpeningClip || videoMuted

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    const syncPlayback = () => {
      video.muted = shouldMuteVideo
      video.volume = shouldMuteVideo ? 0 : 1
      if (media.matches) {
        video.pause()
        return
      }
      void video.play().catch(() => {})
    }

    video.load()
    syncPlayback()
    media.addEventListener("change", syncPlayback)
    return () => media.removeEventListener("change", syncPlayback)
  }, [index, shouldMuteVideo])

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
    <div className="relative w-full overflow-hidden rounded-xl">
      <audio ref={audioRef} src="/hero/piano.mp3" preload="auto" loop />
      <div className="relative aspect-[16/7] min-h-[168px] w-full max-h-[340px] sm:max-h-[400px]">
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover rounded-xl"
          autoPlay
          muted={shouldMuteVideo}
          loop
          playsInline
          preload="auto"
          src={clip.src}
          aria-label={clip.label}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent rounded-xl" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background/40 to-transparent rounded-b-xl" />

        <div className="absolute right-3 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-1.5">
          <button type="button" onClick={nextClip} aria-label="Next video" data-cuelume-press="page" className={controlClassName}>
            <SkipForward className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setVideoMuted((value) => !value)}
            aria-label={
              isOpeningClip
                ? "Opening video audio is off"
                : videoMuted
                  ? "Turn video audio on"
                  : "Turn video audio off"
            }
            className={controlClassName}
            data-cuelume-toggle="tick"
          >
            {shouldMuteVideo ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => setMusicOff((value) => !value)}
            aria-label={musicOff ? "Turn music on" : "Turn music off"}
            className={controlClassName}
            data-cuelume-toggle="tick"
          >
            <Music className={`h-3.5 w-3.5 ${musicOff ? "opacity-40" : ""}`} />
          </button>
        </div>
      </div>
    </div>
  )
}
