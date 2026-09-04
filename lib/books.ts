import fs from "fs"
import path from "path"
import matter from "gray-matter"

export type BookStatus = "to read" | "reading" | "read"

export interface Book {
  slug: string
  title: string
  author: string
  date: string
  rating?: number
  coverImage: string
  spineColor: string
  textColor: string
  status: BookStatus
  content: string
}

const booksDir = path.join(process.cwd(), "content", "Books")

function parseStatus(raw: unknown): BookStatus {
  const s = String(raw || "read").toLowerCase().trim()
  if (s === "to read" || s === "to-read" || s === "toread") return "to read"
  if (s === "reading") return "reading"
  return "read"
}

export function getAllBooks(): Book[] {
  if (!fs.existsSync(booksDir)) return []

  return fs
    .readdirSync(booksDir)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
    .map((fileName) => {
      const slug = fileName.replace(/\.(mdx|md)$/, "")
      const fullPath = path.join(booksDir, fileName)
      const raw = fs.readFileSync(fullPath, "utf8")
      const { data, content } = matter(raw)

      return {
        slug: (data.slug as string) || slug,
        title: (data.title as string) || slug,
        author: (data.author as string) || "",
        date: (data.date as string) || "",
        rating: data.rating as number | undefined,
        coverImage: String(data.coverImage || ""),
        spineColor: String(data.spineColor || "#333"),
        textColor: String(data.textColor || "#fff"),
        status: parseStatus(data.status),
        content,
      } satisfies Book
    })
    .filter((b) => b.coverImage)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getBook(slug: string): Book | null {
  return getAllBooks().find((b) => b.slug === slug) ?? null
}
