"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronRight, Volume2, VolumeX, Music } from "lucide-react"

const CLIPS = [
  { src: "/hero/one-last-check.mp4", label: "One Last Check" },
  { src: "/hero/everything-reacts.mp4", label: "Everything Reacts" },
  { src: "/hero/still-counts-as-indoors.mp4", label: "Still Counts as Indoors" },
  { src: "/hero/could-leave-anytime.mp4", label: "Could Leave Anytime" },
] as const

const controlClassName =
  "flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.06] text-foreground/50 backdrop-blur-xl border border-white/[0.08] transition-all hover:bg-white/[0.12] hover:text-foreground/80"

export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([])
  const audioRef = useRef<HTMLAudioElement>(null)
  const [activeClip, setActiveClip] = useState(1)
  const [requestedClip, setRequestedClip] = useState(1)
  const [videoMuted, setVideoMuted] = useState(false)
  const [musicOff, setMusicOff] = useState(false)
  const shouldMuteVideo = videoMuted

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    video.muted = shouldMuteVideo
    video.volume = shouldMuteVideo ? 0 : 1
    if (media.matches) {
      video.pause()
      return
    }

    const playVideo = () => void video.play().catch(() => {})
    playVideo()
    media.addEventListener("change", playVideo)
    return () => media.removeEventListener("change", playVideo)
  }, [activeClip, shouldMuteVideo])

  const nextClip = () => {
    setRequestedClip((index) => (index + 1) % CLIPS.length)
  }

  useEffect(() => {
    if (requestedClip === activeClip) return
    const pendingVideo = videoRefs.current[requestedClip]
    if (!pendingVideo) return
    pendingVideo.load()
    void pendingVideo.play().catch(() => {})
  }, [requestedClip, activeClip])

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

  return (
    <div className="relative w-full overflow-hidden rounded-xl">
      <audio ref={audioRef} src="/hero/piano.mp3" preload="auto" loop />
      <div className="relative aspect-[16/7] min-h-[168px] w-full max-h-[340px] sm:max-h-[400px]">
        {CLIPS.map((clip, index) => (
          <video
            key={clip.src}
            ref={(element) => {
              videoRefs.current[index] = element
              if (index === activeClip) videoRef.current = element
            }}
            className={`absolute inset-0 h-full w-full rounded-xl object-cover transition-opacity duration-200 ${index === activeClip ? "opacity-100" : "pointer-events-none opacity-0"}`}
            autoPlay={index === activeClip}
            muted={shouldMuteVideo}
            loop
            playsInline
            preload="auto"
            src={clip.src}
            onCanPlay={() => {
              if (index !== requestedClip || index === activeClip) return
              setActiveClip(index)
              void videoRefs.current[index]?.play().catch(() => {})
            }}
            onCanPlayThrough={() => {
              if (index !== requestedClip || index === activeClip) return
              setActiveClip(index)
              void videoRefs.current[index]?.play().catch(() => {})
            }}
            aria-hidden={index !== activeClip}
            aria-label={index === activeClip ? clip.label : undefined}
          />
        ))}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent rounded-xl" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background/40 to-transparent rounded-b-xl" />

        <div className="absolute right-3 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-1.5">
          <button
            type="button"
            onClick={nextClip}
            aria-label={`Change video. Currently showing ${CLIPS[activeClip].label}`}
            className={`${controlClassName} bg-white/[0.1] text-foreground/70`}
            data-cuelume-toggle="tick"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setVideoMuted((value) => !value)}
            aria-label={videoMuted ? "Turn video audio on" : "Turn video audio off"}
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
