"use client"

import { useState } from "react"
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
  { title: "Lake of Tears", maker: "Ilya Glazunov", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Ilya_Glazunov._Lake_of_tears.jpg/1200px-Ilya_Glazunov._Lake_of_tears.jpg" },
  { title: "October", maker: "Très Riches Heures, Limbourg Brothers", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Les_Tr%C3%A8s_Riches_Heures_du_Duc_de_Berry_octobre.jpg/1200px-Les_Tr%C3%A8s_Riches_Heures_du_Duc_de_Berry_octobre.jpg" },
  { title: "View of Delft", maker: "Johannes Vermeer, 1661", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Vermeer-view-of-delft.jpg/1200px-Vermeer-view-of-delft.jpg" },
]

export default function FavoritePhotosCarousel({ artworks = [] }: { artworks?: FavoriteArtwork[] }) {
  const favorites = Array.from(
    new Map([...artworks, ...providedArtworks]
      .filter((artwork) => !["image-dJN6tgJXQwm37VfKPQ0O0ZEYuf2dqb", "image-37pN1ee8fFaWhKhSguCiEFpP86ab3k", "image-rcPyH46EKMi15hGa3oskv5jGDkK2Ba"].some((asset) => artwork.image.includes(asset)))
      .map((artwork) => [artwork.image, artwork])).values(),
  )

  const marqueeItems = [
    favorites[0],
    favorites[1],
    favorites[2],
    favorites[6],
    favorites[8],
    favorites[0],
    favorites[1],
    favorites[2],
    favorites[6],
    favorites[8],
  ].filter(Boolean) as FavoriteArtwork[]

  const textCard: FavoriteArtwork = {
    title: "Lake of Tears",
    maker: "by Ilya Glazunov",
    image: favorites[6]?.image ?? providedArtworks[6].image,
  }

  const [isPaused, setIsPaused] = useState(false)
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
          className={`favorite-photos-track ${isPaused ? "is-paused" : ""} flex items-center gap-1`}
          initial={false}
        >
          {marqueeItems.map((artwork, index) => {
            const isTextCard = index === 3 || index === 8
            if (isTextCard) {
              return (
                <motion.button
                  type="button"
                  key={`${artwork.image}-${index}-text`}
                  className="group relative flex h-56 w-[13rem] shrink-0 items-center justify-center overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/20 px-4 text-center shadow-[0_18px_36px_-26px_rgba(0,0,0,0.9)] backdrop-blur-[2px] sm:h-64 sm:w-[14rem]"
                  onMouseEnter={() => setIsPaused(true)}
                  onMouseLeave={() => setIsPaused(false)}
                  onClick={() => setLightboxArtwork(textCard)}
                >
                  <div className="text-center text-[#edf8ff]">
                    <div className="font-newsreader text-[1.5rem] italic leading-[1.1] text-foreground">Lake of Tears</div>
                    <div className="mt-2 text-[0.95rem] text-foreground/75">by Ilya Glazunov</div>
                    <div className="mt-6 text-[1.5rem] italic leading-[1.1] text-foreground">October</div>
                    <div className="mt-2 text-[0.95rem] text-foreground/75">by Trés Riches Heures, Limbourg Brothers</div>
                    <div className="mt-6 text-[1.5rem] italic leading-[1.1] text-foreground">View of Delft</div>
                    <div className="mt-2 text-[0.95rem] text-foreground/75">by Johannes Vermeer, 1661</div>
                  </div>
                </motion.button>
              )
            }

            return (
              <motion.figure
                key={`${artwork.image}-${index}`}
                className="group relative h-56 w-[8.5rem] shrink-0 cursor-pointer overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5 shadow-[0_18px_36px_-26px_rgba(0,0,0,0.9)] sm:h-64 sm:w-[9.5rem]"
                initial={false}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onClick={() => setLightboxArtwork(artwork)}
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
          onClick={() => setLightboxArtwork(null)}
        >
          <figure className="relative max-h-[90vh] max-w-[92vw] overflow-hidden rounded-2xl bg-black shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <img src={lightboxArtwork.image} alt={`${lightboxArtwork.title} by ${lightboxArtwork.maker}`} className="max-h-[78vh] max-w-[88vw] object-contain" />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent px-5 pb-5 pt-16 text-white">
              <p className="text-base">{lightboxArtwork.title}</p>
              <p className="text-sm text-white/65">{lightboxArtwork.maker}</p>
            </figcaption>
            <button type="button" className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-lg text-white" aria-label="Close photo" onClick={() => setLightboxArtwork(null)}>×</button>
          </figure>
        </div>
      )}
    </section>
  )
}

export type { FavoriteArtwork }
