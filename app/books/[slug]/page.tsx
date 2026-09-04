import Link from "next/link"
import { notFound } from "next/navigation"
import { getBook, getAllBooks } from "@/lib/books"
import type { ContentItem } from "@/lib/content"
import { getAllSubstackFieldnotes } from "@/lib/substack"
import { ModeToggle } from "@/components/mode-toggle"
import CommandPaletteWrapper from "@/components/command-palette-wrapper"
import MDXRenderer from "@/components/mdx-renderer"

interface BookPageProps {
  params: Promise<{ slug: string }>
}

function bookToContentItem(book: NonNullable<ReturnType<typeof getBook>>): ContentItem {
  return {
    slug: book.slug,
    title: book.title,
    date: book.date,
    summary: book.author ? `by ${book.author}` : "",
    banner: book.coverImage,
    tags: ["book"],
    draft: false,
    content: book.content,
  }
}

export async function generateStaticParams() {
  return getAllBooks().map((b) => ({ slug: b.slug }))
}

export async function generateMetadata({ params }: BookPageProps) {
  const { slug } = await params
  const book = getBook(slug)
  if (!book) return { title: "Book not found" }
  return {
    title: `${book.title} — Shayaan Azeem`,
    description: book.author ? `${book.title} · ${book.author}` : book.title,
  }
}

export default async function BookPage({ params }: BookPageProps) {
  const { slug } = await params
  const book = getBook(slug)
  const allFieldnotes = await getAllSubstackFieldnotes()

  if (!book) notFound()

  const item = bookToContentItem(book)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-foreground">
            home
          </Link>
          <span aria-hidden>·</span>
          <span>bookshelf</span>
        </div>

        <header className="mb-10 border-b border-border pb-8">
          <p className="text-sm uppercase tracking-wide text-muted-foreground">{book.author}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{book.title}</h1>
          {book.date ? <p className="mt-2 text-sm text-muted-foreground">{book.date}</p> : null}
        </header>

        <MDXRenderer item={item} />
      </div>

      <CommandPaletteWrapper fieldnotes={allFieldnotes} currentSection="content" currentPage={book.title} />
    </div>
  )
}
