export interface SubstackArticle {
  slug: string
  title: string
  date: string
  summary: string
  banner?: string
  tags: string[]
  draft: boolean
  content: string
  substackUrl: string
}

const SUBSTACK_ARTICLES: Record<string, SubstackArticle> = {}

export async function getAllSubstackFieldnotes(): Promise<SubstackArticle[]> {
  return Object.values(SUBSTACK_ARTICLES)
    .filter(article => !article.draft)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getSubstackFieldnote(slug: string): SubstackArticle | null {
  return SUBSTACK_ARTICLES[slug] || null
}

export function getSubstackFieldnoteByUrl(url: string): SubstackArticle | null {
  return Object.values(SUBSTACK_ARTICLES).find(article => article.substackUrl === url) || null
}
