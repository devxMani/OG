import React, { useState } from 'react'
import FavoritePhotosCarousel from '@/components/favorite-photos-carousel'

interface AboutRendererProps {
  content: string
}

const hoverClassMap: Record<string, string> = {
  '1': 'link-uwaterloo',
  '2': 'link-revisiondojo',
  '5': 'link-bloomberg',
  '7': 'link-teenbuilders',
  '8': 'link-hackclub',
  '9': 'link-hackclub',
  '10': 'link-hackathon',
  '11': 'link-robotics',
  '12': 'link-olympiad',
  '13': 'link-codecamp',
}

const KNOWN = [
  'intro',
  'selected work',
  'experiences',
  "some cool things i've done in the past:",
  'how i started:',
  'where do i see myself in 10 years:',
]

export default function AboutRenderer({ content }: AboutRendererProps) {
  const [showMore, setShowMore] = useState(false)

  const parseAboutContent = (text: string) => {
    const sections = text.split('\n## ').filter((s) => s.trim())
    const parsed: Record<string, string> = {}
    sections.forEach((section) => {
      const lines = section.split('\n')
      const title = lines[0].replace('## ', '').trim()
      parsed[title] = lines.slice(1).join('\n').trim()
    })
    return parsed
  }

  const parseHoverLinks = (text: string) => {
    const processed = text
      .replace(/^###\s*/gm, '')
      .replace(/^>\s*/gm, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[hover-rank\]([^[]+)\[\/hover-rank\]/g, (_m, r) =>
        `<span class="hover-rank-toggle group/rank cursor-default"><span class="group-hover/rank:hidden">${r}</span><span class="hidden group-hover/rank:inline">2.5%</span></span>`
      )
    return processed
      .replace(/\[hover-(\d+)\]\s*\[([^\]]+)\]\(([^)]+)\)/g, (_m, num, title, url) => {
        const cls = hoverClassMap[num] || 'link-blue'
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="${cls}">${title}</a>`
      })
      .replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, (_m, title, url) =>
        `<a href="${url}" target="_blank" rel="noopener noreferrer">${title}</a>`
      )
  }

  // List items use the "–" dash bullet from globals.css .tight-list-item
  const parseBulletPoints = (text: string, isListItem = false, key?: React.Key) => {
    const html = parseHoverLinks(text)
    if (isListItem) {
      return <li key={key} className="tight-list-item" dangerouslySetInnerHTML={{ __html: html }} />
    }
    return <span dangerouslySetInnerHTML={{ __html: html }} />
  }

  const renderBlocks = (body: string) =>
    body.split('\n\n').map((block, i) => {
      if (block.includes('\n- ') || block.trim().startsWith('- ')) {
        return (
          <ul key={i} className="list-none mt-3 space-y-3">
            {block
              .split('\n- ')
              .filter((item) => item.trim())
              .map((item, j) => parseBulletPoints(item.replace(/^- /, '').trim(), true, j))}
          </ul>
        )
      }
      return <p key={i} className="mt-3">{parseBulletPoints(block)}</p>
    })

  const sections = parseAboutContent(content)
  const extraSections = Object.keys(sections).filter((k) => !KNOWN.includes(k))

  return (
    <div className="portfolio-content">

      {/* ── intro ── */}
      {sections.intro && (
        <section>
          {sections.intro.split('\n\n').map((paragraph, index) => {
            if (index === 0) {
              // eyebrow e.g. "RESEARCH · SYSTEMS · TASTE"
              return (
                <span key={index} className="section-label">
                  {paragraph.replace(/\*/g, '')}
                </span>
              )
            }
            if (index === 1) {
              // big italic lede headline
              return (
                <p
                  key={index}
                  className="mb-6 font-instrument text-[23px] italic leading-[1.3] text-foreground sm:text-[26px]"
                >
                  {parseBulletPoints(paragraph)}
                </p>
              )
            }
            // remaining intro paragraphs — tighter colour, slightly smaller
            return (
              <p key={index} className="mb-3 text-[15px] leading-relaxed text-foreground/72">
                {parseBulletPoints(paragraph)}
              </p>
            )
          })}
        </section>
      )}

      {/* ── selected work ── */}
      {sections['selected work'] && (
        <section className="mt-8 pt-8 border-t border-foreground/[0.07]">
          <span className="section-label">Work</span>
          <h2 className="section-title">selected work</h2>
          {renderBlocks(sections['selected work'])}
        </section>
      )}

      {/* ── experience — no eyebrow, dash bullets ── */}
      {sections.experiences && (
        <section className="mt-8 pt-8 border-t border-foreground/[0.07]">
          {/* no eyebrow label */}
          <h2 className="section-title">experience</h2>
          {renderBlocks(sections.experiences)}
        </section>
      )}

      {/*
        ── a few other things ──
        No "ELSEWHERE" eyebrow per user request.
        Dash bullets via .tight-list-item.
      */}
      {sections["some cool things i've done in the past:"] && (
        <section className="mt-8 pt-8 border-t border-foreground/[0.07]">
          {/* eyebrow intentionally removed */}
          <h2 className="section-title">a few other things</h2>
          {renderBlocks(sections["some cool things i've done in the past:"])}
        </section>
      )}

      {/* ── any extra ## sections auto-render ── */}
      {extraSections.map((key) => (
        <section key={key} className="mt-8 pt-8 border-t border-foreground/[0.07]">
          <h2 className="section-title">{key.replace(/:$/, '')}</h2>
          {renderBlocks(sections[key])}
        </section>
      ))}

      {/* ── expandable: origin / ten years ── */}
      {(sections['how i started:'] || sections['where do i see myself in 10 years:']) && (
        <div className="mt-8 pt-8 border-t border-foreground/[0.07]">
          <button
            onClick={() => setShowMore(!showMore)}
            aria-expanded={showMore}
            className="text-[12px] uppercase tracking-[0.18em] text-foreground/40 transition-colors hover:text-foreground"
          >
            {showMore ? 'Less' : 'More'}
          </button>
          {showMore && (
            <div className="mt-8 space-y-8">
              {sections['how i started:'] && (
                <div>
                  <span className="section-label">Origin</span>
                  {renderBlocks(sections['how i started:'])}
                </div>
              )}
              {sections['where do i see myself in 10 years:'] && (
                <div>
                  <span className="section-label">Ten years out</span>
                  {renderBlocks(sections['where do i see myself in 10 years:'])}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── photos carousel ── */}
      <div className="mt-10">
        <FavoritePhotosCarousel />
      </div>
    </div>
  )
}