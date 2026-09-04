import { execSync } from "child_process"

const GITHUB_REPO = "devxMani/OG"

function formatDate(date: Date) {
  return date
    .toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase()
}

function getLastUpdatedFromGit() {
  try {
    const raw = execSync('git log -1 --format=%cI', {
      encoding: "utf-8",
      cwd: process.cwd(),
    }).trim()

    if (!raw) return null
    return formatDate(new Date(raw))
  } catch {
    return null
  }
}

export async function getLastUpdated() {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/commits?per_page=1`,
      {
        next: { revalidate: 3600 },
        headers: {
          Accept: "application/vnd.github+json",
        },
      }
    )

    if (response.ok) {
      const commits = await response.json()
      const date = commits?.[0]?.commit?.committer?.date

      if (date) {
        return formatDate(new Date(date))
      }
    }
  } catch {
    // fall through to local git
  }

  return getLastUpdatedFromGit() ?? formatDate(new Date())
}
