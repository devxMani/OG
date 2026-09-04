import { getAbout, getContentWorthConsuming, getPhilosophy } from "@/lib/content"
import { getAllBooks } from "@/lib/books"
import { getAllSubstackFieldnotes } from "@/lib/substack"
import { getLastUpdated } from "@/lib/last-updated"

export async function getClientHomeData() {
  const [fieldnotes, lastUpdated] = await Promise.all([
    getAllSubstackFieldnotes(),
    getLastUpdated(),
  ])

  return {
    fieldnotes,
    philosophy: getPhilosophy(),
    contentWorthConsuming: getContentWorthConsuming(),
    about: getAbout(),
    books: getAllBooks(),
    lastUpdated,
  }
}
