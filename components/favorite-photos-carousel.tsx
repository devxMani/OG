"use client"

import { useState } from "react"
import { motion } from "framer-motion"

type FavoriteArtwork = { title: string; maker: string; image: string }

const providedArtworks: FavoriteArtwork[] = [
  { title: "Bulls in the Sea", maker: "Joaquín Sorolla, 1903", image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-AEOBAhPjo9sqwALrnbiJlTPXykWVAi.png" },
  { title: "The Dream City", maker: "Thomas Moran", image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-E0pMVy0EeUtl7Q5Qiys9fgCjKOt4Xo.png" },
  { title: "Monks in a monastery courtyard", maker: "Franz Ludwig Catel", image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-2e29Do9yHyFR5htg2wh1BatKt8BdDE.png" },
  { title: "Grazing in the upper valley", maker: "Tommaso Cascella", image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-1MrUdq13746fjevelJSiCHGdPPWcQw.png" },
]

export default function FavoritePhotosCarousel({ artworks = [] }: { artworks?: FavoriteArtwork[] }) {
  const favorites = [...artworks, ...providedArtworks]
  const loop = [...favorites, ...favorites]
  const [paused, setPaused] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const cycleDistance = favorites.length * 13

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
          className="flex w-max items-center gap-2"
          animate={paused ? undefined : { x: [0, `-${cycleDistance}rem`] }}
          transition={paused ? undefined : { duration: 38, ease: "linear", repeat: Infinity }}
        >
          {loop.map((artwork, index) => {
            const key = `${artwork.title}-${index}`
            const isSelected = selected === key
            return (
              <motion.figure
                key={key}
                className="group relative h-56 w-20 shrink-0 cursor-pointer overflow-hidden rounded-xl sm:h-64"
                animate={{ width: isSelected ? "21rem" : "5rem" }}
                whileHover={{ width: isSelected ? "21rem" : "21rem" }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => {
                  setSelected(isSelected ? null : key)
                  setPaused(!isSelected)
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
    </section>
  )
}

export type { FavoriteArtwork }
