"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import type { Book, BookStatus } from "@/lib/books"

const SPINE_PX = 41.5
const COVER_W_MULT = 4
const BOOK_H = 220

interface BookshelfProps {
  books: Book[]
}

const statusOrder: BookStatus[] = ["to read", "reading", "read"]

function statusDotClass(s: BookStatus) {
  if (s === "to read") return "bg-zinc-600"
  if (s === "reading") return "bg-zinc-400"
  return "bg-emerald-400"
}

function statusRowClass(s: BookStatus, filter: BookStatus | "all") {
  if (filter === "all") return "text-muted-foreground hover:text-foreground"
  return filter === s ? "text-foreground" : "text-muted-foreground hover:text-foreground/90"
}

export function Bookshelf({ books }: BookshelfProps) {
  const [filter, setFilter] = React.useState<BookStatus | "all">("all")
  const [bookIndex, setBookIndex] = React.useState(-1)

  const visible = filter === "all" ? books : books.filter((b) => b.status === filter)

  const spineW = `${SPINE_PX}px`
  const coverW = `${SPINE_PX * COVER_W_MULT}px`
  const bookH = `${BOOK_H}px`

  return (
    <section className="border-t border-border/50 pt-10">
      <svg
        style={{
          position: "absolute",
          inset: 0,
          visibility: "hidden",
        }}
      >
        <defs>
          <filter id="paper" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="8"
              result="noise"
            />
            <feDiffuseLighting
              in="noise"
              lightingColor="white"
              surfaceScale="1"
              result="diffLight"
            >
              <feDistantLight azimuth="45" elevation="35" />
            </feDiffuseLighting>
          </filter>
        </defs>
      </svg>

      <div className="mb-10">
        <h2 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          <span className="size-2 shrink-0 rounded-full bg-foreground" aria-hidden />
          bookshelf
        </h2>
        <p className="mt-4 max-w-xl font-serif text-lg italic leading-relaxed text-muted-foreground underline decoration-[#c45c26] decoration-1 underline-offset-4">
          think before you speak. read before you think.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-6 text-sm">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={cn(
              "transition-colors",
              filter === "all" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            all
          </button>
          {statusOrder.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={cn("flex items-center gap-2 transition-colors", statusRowClass(s, filter))}
            >
              <span className={cn("size-2 shrink-0 rounded-full", statusDotClass(s))} />
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:gap-x-8 xl:gap-y-12">
        {visible.map((book, index) => (
          <button
            key={book.slug}
            type="button"
            onClick={() => setBookIndex(index === bookIndex ? -1 : index)}
            className="group mx-auto block w-max outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            style={{
              perspective: "1000px",
              WebkitPerspective: "1000px",
            }}
          >
            <div
              className="flex items-center transition-all duration-500 ease-in-out"
              style={{
                transformStyle: "preserve-3d",
              }}
            >
              <div
                className="relative flex shrink-0 items-start justify-center overflow-hidden transition-all duration-500 ease-in-out"
                style={{
                  width: spineW,
                  height: bookH,
                  backgroundColor: book.spineColor,
                  color: book.textColor,
                  transformOrigin: "right",
                  transformStyle: "preserve-3d",
                  transform: `translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(${
                    bookIndex === index ? "-60deg" : "-25deg"
                  }) rotateZ(0deg) skew(0deg, 0deg)`,
                  filter: "brightness(0.8) contrast(2)",
                }}
              >
                <span
                  style={{
                    pointerEvents: "none",
                    position: "absolute",
                    inset: 0,
                    zIndex: 50,
                    opacity: 0.4,
                    filter: "url(#paper)",
                  }}
                />
                <h3
                  className="mt-3 max-h-[196px] overflow-hidden text-ellipsis whitespace-nowrap px-1 text-[11px] font-bold"
                  style={{ writingMode: "vertical-rl", fontFamily: '"DM Sans", sans-serif' }}
                >
                  {book.title}
                </h3>
              </div>

              <div
                className="relative shrink-0 overflow-hidden transition-all duration-500 ease-in-out"
                style={{
                  width: coverW,
                  height: bookH,
                  transformOrigin: "left",
                  transformStyle: "preserve-3d",
                  transform: `translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(${
                    bookIndex === index ? "30deg" : "60deg"
                  }) rotateZ(0deg) skew(0deg, 0deg)`,
                  filter: "brightness(0.8) contrast(2)",
                }}
              >
                <span
                  style={{
                    pointerEvents: "none",
                    position: "absolute",
                    inset: 0,
                    zIndex: 50,
                    opacity: 0.4,
                    filter: "url(#paper)",
                  }}
                />
                <span
                  style={{
                    pointerEvents: "none",
                    position: "absolute",
                    inset: 0,
                    zIndex: 50,
                    background:
                      "linear-gradient(to right, rgba(255, 255, 255, 0) 2px, rgba(255, 255, 255, 0.5) 3px, rgba(255, 255, 255, 0.25) 4px, rgba(255, 255, 255, 0.25) 6px, transparent 7px, transparent 9px, rgba(255, 255, 255, 0.25) 9px, transparent 12px)",
                  }}
                />
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="block h-full w-full object-cover"
                  draggable={false}
                />
              </div>
            </div>
            <p className="mt-4 text-center text-xs text-muted-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              {book.author}
            </p>
          </button>
        ))}
      </div>
    </section>
  )
}
