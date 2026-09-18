"use client"

import { useState, type CSSProperties } from "react"
import { motion } from "framer-motion"
import "./favorite-photos-carousel.css"

type FavoriteArtwork = { title: string; maker: string; image: string }

const providedArtworks: FavoriteArtwork[] = [
  { title: "Monks in a monastery courtyard", maker: "Franz Ludwig Catel", image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-2e29Do9yHyFR5htg2wh1BatKt8BdDE.png" },
  { title: "Grazing in the upper valley", maker: "Tommaso Cascella", image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-1MrUdq13746fjevelJSiCHGdPPWcQw.png" },
  { title: "The Fleeting Hour", maker: "Jim Buckels", image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-H9PdXCRY8vRVNqpgdPs1KulKV9rm9s.png" },
  { title: "Architect's Afternoon", maker: "Iwo Zaniewski", image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-ZW4L1fssw6yQozIRc5rdNeYcGHnGqU.png" },
  { title: "Two on a Bridge", maker: "Igor Shcherbakov", image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-fLW9jE5c4GwVCghT0XniyUDyJcbmWO.png" },
  { title: "Paris of the Future", maker: "Jean Giraud (Moebius)", image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-fUmc5kVWXYqbAl2K1zeCPJEdDvPyWT.png" },
]

export default function FavoritePhotosCarousel({ artworks = [] }: { artworks?: FavoriteArtwork[] }) {
  const favorites = Array.from(
    new Map([...artworks, ...providedArtworks]
      .filter((artwork) => !["image-dJN6tgJXQwm37VfKPQ0O0ZEYuf2dqb", "image-37pN1ee8fFaWhKhSguCiEFpP86ab3k", "image-rcPyH46EKMi15hGa3oskv5jGDkK2Ba"].some((asset) => artwork.image.includes(asset)))
      .map((artwork) => [artwork.image, artwork])).values(),
  )
  const loop = [...favorites, ...favorites]
  const [paused, setPaused] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [lightboxArtwork, setLightboxArtwork] = useState<FavoriteArtwork | null>(null)

  return (
    <section aria-labelledby="photos-i-love" className="mt-16 mb-4 overflow-hidden">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">a moving collection</p>
          <h3 id="photos-i-love" className="font-newsreader text-3xl italic text-foreground">photos i love</h3>
        </div>
        <span className="hidden text-xs text-muted-foreground sm:block">hover to linger</span>
      </div>
      <div className="relative -mx-4 overflow-hidden px-4 sm:-mx-8 sm:px-8">
        <motion.div
          className={`favorite-photos-track flex w-max items-center gap-2${paused ? " is-paused" : ""}`}
          style={{ "--favorite-count": favorites.length } as CSSProperties}
        >
          {loop.map((artwork, index) => {
            const key = `${artwork.title}-${index}`
            const isSelected = selected === key
            return (
              <motion.figure
                key={key}
                className="group relative h-56 w-20 shrink-0 cursor-pointer overflow-hidden rounded-xl sm:h-64"
                animate={{ width: isSelected ? "21rem" : "5rem" }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => {
                  if (isSelected) {
                    setSelected(null)
                    setPaused(false)
                    return
                  }
                  setSelected(key)
                  setPaused(true)
                  setLightboxArtwork(artwork)
                }}
              >
                <img src={artwork.image} alt={`${artwork.title} by ${artwork.maker}`} className="h-full w-full object-cover" loading="lazy" />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 pt-12 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span className="block text-sm">{artwork.title}</span>
                  <span className="block text-xs text-white/65">{artwork.maker}</span>
                </figcaption>
              </motion.figure>
            )
          })}
        </motion.div>
      </div>
      {lightboxArtwork && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`${lightboxArtwork.title} by ${lightboxArtwork.maker}`}
          onClick={() => {
            setLightboxArtwork(null)
            setSelected(null)
            setPaused(false)
          }}
        >
          <figure className="relative max-h-[90vh] max-w-[92vw] overflow-hidden rounded-2xl bg-black shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <img src={lightboxArtwork.image} alt={`${lightboxArtwork.title} by ${lightboxArtwork.maker}`} className="max-h-[78vh] max-w-[88vw] object-contain" />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent px-5 pb-5 pt-16 text-white">
              <p className="text-base">{lightboxArtwork.title}</p>
              <p className="text-sm text-white/65">{lightboxArtwork.maker}</p>
            </figcaption>
            <button type="button" className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-lg text-white" aria-label="Close photo" onClick={() => { setLightboxArtwork(null); setSelected(null); setPaused(false) }}>×</button>
          </figure>
        </div>
      )}
    </section>
  )
}

export type { FavoriteArtwork }
