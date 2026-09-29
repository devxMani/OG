"use client"

import { AnimatePresence, motion } from "framer-motion"
import React, { useState } from "react"
import { cn } from "@/lib/utils"
import "./favorite-photos-carousel.css"

type FavoriteArtwork = {
  src: string
  alt: string
  code?: string
  title?: string
  maker?: string
  image?: string
}

const defaultImages: FavoriteArtwork[] = [
  {
    src: "/images/artworks/new-years-eve.jpg",
    image: "/images/artworks/new-years-eve.jpg",
    alt: "New Year's Eve",
    title: "New Year's Eve",
    maker: "Sergei Andriyaka",
    code: "# 01",
  },
  {
    src: "/images/artworks/view-of-delft.jpg",
    image: "/images/artworks/view-of-delft.jpg",
    alt: "View of Delft",
    title: "View of Delft",
    maker: "Johannes Vermeer, 1661",
    code: "# 02",
  },
  {
    src: "/images/artworks/monks-monastery.jpg",
    image: "/images/artworks/monks-monastery.jpg",
    alt: "Monks in a monastery courtyard",
    title: "Monks in a monastery courtyard",
    maker: "Franz Ludwig Catel",
    code: "# 03",
  },
  {
    src: "/images/artworks/jewish-cemetery.jpg",
    image: "/images/artworks/jewish-cemetery.jpg",
    alt: "The Jewish Cemetery",
    title: "The Jewish Cemetery",
    maker: "Jacob van Ruisdael",
    code: "# 04",
  },
  {
    src: "/images/artworks/lake-of-tears.jpg",
    image: "/images/artworks/lake-of-tears.jpg",
    alt: "Lake of Tears",
    title: "Lake of Tears",
    maker: "Ilya Glazunov",
    code: "# 05",
  },
  {
    src: "/images/artworks/october.jpg",
    image: "/images/artworks/october.jpg",
    alt: "October",
    title: "October",
    maker: "Très Riches Heures, Limbourg Brothers",
    code: "# 06",
  },
  {
    src: "/images/artworks/grazing-upper-valley.png",
    image: "/images/artworks/grazing-upper-valley.png",
    alt: "Grazing in the upper valley",
    title: "Grazing in the upper valley",
    maker: "Tommaso Cascella",
    code: "# 07",
  },
  {
    src: "/images/artworks/the-fleeting-hour.png",
    image: "/images/artworks/the-fleeting-hour.png",
    alt: "The Fleeting Hour",
    title: "The Fleeting Hour",
    maker: "Jim Buckels",
    code: "# 08",
  },
  {
    src: "/images/artworks/architects-afternoon.png",
    image: "/images/artworks/architects-afternoon.png",
    alt: "Architect's Afternoon",
    title: "Architect's Afternoon",
    maker: "Iwo Zaniewski",
    code: "# 09",
  },
  {
    src: "/images/artworks/two-on-a-bridge.png",
    image: "/images/artworks/two-on-a-bridge.png",
    alt: "Two on a Bridge",
    title: "Two on a Bridge",
    maker: "Igor Shcherbakov",
    code: "# 10",
  },
  {
    src: "/images/artworks/paris-future.png",
    image: "/images/artworks/paris-future.png",
    alt: "Paris of the Future",
    title: "Paris of the Future",
    maker: "Jean Giraud (Moebius)",
    code: "# 11",
  },
]

export const HoverExpand_001 = ({
  images = defaultImages,
  className,
}: {
  images?: FavoriteArtwork[]
  className?: string
}) => {
  const [activeImage, setActiveImage] = useState<number | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [lightboxArtwork, setLightboxArtwork] = useState<FavoriteArtwork | null>(null)

  // Duplicate items for infinite seamless looping horizontal marquee
  const marqueeItems = [...images, ...images]

  return (
    <motion.div
      initial={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        duration: 0.3,
        delay: 0.2,
      }}
      className={cn("relative w-full overflow-hidden py-4", className)}
    >
      <div className="w-full overflow-hidden py-2">
        <motion.div
          animate={isPaused ? false : { x: ["0%", "-50%"] }}
          transition={{
            duration: 45,
            ease: "linear",
            repeat: Infinity,
          }}
          className="flex w-max items-center gap-2.5"
        >
          {marqueeItems.map((image, index) => {
            const imgSrc = image.src || image.image || ""
            const isSelected = activeImage === index
            return (
              <motion.div
                key={index}
                className="relative cursor-pointer overflow-hidden rounded-3xl border border-white/10 shadow-xl bg-black/40 shrink-0"
                initial={{ width: "5rem", height: "22rem" }}
                animate={{
                  width: isSelected ? "24rem" : "5.5rem",
                  height: "22rem",
                }}
                transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
                onClick={() => setLightboxArtwork(image)}
                onMouseEnter={() => {
                  setIsPaused(true)
                  setActiveImage(index)
                }}
                onMouseLeave={() => {
                  setIsPaused(false)
                  setActiveImage(null)
                }}
              >
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-10 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-6 flex flex-col justify-end pointer-events-none"
                    >
                      <p className="font-newsreader text-xl italic text-white leading-tight">
                        {image.title || image.alt}
                      </p>
                      {image.maker && (
                        <p className="text-sm text-white/80 mt-1 font-sans">
                          {image.maker}
                        </p>
                      )}
                      {image.code && (
                        <p className="text-xs text-white/40 font-mono mt-3">
                          {image.code}
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
                <img
                  src={imgSrc}
                  className="size-full object-cover transition-transform duration-700 hover:scale-105"
                  alt={image.alt || image.title || "Artwork"}
                  loading="lazy"
                />
              </motion.div>
            )
          })}
        </motion.div>
      </div>

      {/* Lightbox photo modal */}
      {lightboxArtwork && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label={`${lightboxArtwork.title} by ${lightboxArtwork.maker}`}
          onClick={() => setLightboxArtwork(null)}
        >
          <figure
            className="relative max-h-[90vh] max-w-[92vw] overflow-hidden rounded-2xl bg-black shadow-2xl border border-white/10"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={lightboxArtwork.src || lightboxArtwork.image}
              alt={`${lightboxArtwork.title} by ${lightboxArtwork.maker}`}
              className="max-h-[78vh] max-w-[88vw] object-contain"
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent px-6 pb-6 pt-16 text-white">
              <p className="font-newsreader text-2xl italic">{lightboxArtwork.title}</p>
              <p className="text-sm text-white/70 mt-1">{lightboxArtwork.maker}</p>
            </figcaption>
            <button
              type="button"
              className="absolute right-4 top-4 rounded-full bg-black/60 hover:bg-black/80 w-8 h-8 flex items-center justify-center text-lg text-white border border-white/20 transition-colors"
              aria-label="Close photo"
              onClick={() => setLightboxArtwork(null)}
            >
              ×
            </button>
          </figure>
        </div>
      )}
    </motion.div>
  )
}

export const Skiper52 = () => {
  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden bg-transparent">
      <HoverExpand_001 images={defaultImages} />
    </div>
  )
}

export default function FavoritePhotosCarousel({
  artworks,
}: {
  artworks?: { title: string; maker: string; image: string }[]
}) {
  const formattedImages: FavoriteArtwork[] = (artworks && artworks.length > 0)
    ? artworks.map((item, idx) => ({
        src: item.image,
        image: item.image,
        alt: item.title,
        title: item.title,
        maker: item.maker,
        code: `# ${String(idx + 1).padStart(2, "0")}`,
      }))
    : defaultImages

  return (
    <section aria-labelledby="photos-i-love" className="mt-12 mb-6 overflow-hidden">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            a moving collection
          </p>
          <h3 id="photos-i-love" className="font-newsreader text-3xl italic text-foreground">
            photos i love
          </h3>
        </div>
        <span className="hidden text-xs text-muted-foreground sm:block">
          hover to linger & expand
        </span>
      </div>

      <HoverExpand_001 images={formattedImages} />
    </section>
  )
}

export type { FavoriteArtwork }
