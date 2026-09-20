"use client"

import CommandPalette from "@/components/command-palette"

interface CommandPaletteWrapperProps {
  fieldnotes?: Array<{ slug: string; substackUrl: string }>
  experiences?: Array<{
    title: string
    type: "Internship" | "Project" | "Community"
    link?: string
    hasDetailPage?: boolean
    image?: string
  }>
  currentSection?: string
  currentPage?: string
  onNavigate?: (section: string) => void
  onSelectProject?: (project: string) => void
}

export default function CommandPaletteWrapper({
  fieldnotes = [],
  experiences = [],
  currentSection = "about",
  currentPage = "Home",
  onNavigate = () => {},
  onSelectProject = () => {},
}: CommandPaletteWrapperProps) {
  return (
    <CommandPalette
      fieldnotes={fieldnotes as any}
      experiences={experiences as any}
      currentSection={currentSection}
      currentPage={currentPage}
      onNavigate={onNavigate}
      onSelectProject={onSelectProject}
    />
  )
}
