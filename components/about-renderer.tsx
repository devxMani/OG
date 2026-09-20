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

/* Sections that get their own slot below, in this order. Anything else in
   about.md is rendered automatically by the generic pass, so you can add a
   new "## heading" to the markdown and it just shows up. */
const KNOWN = [
  'intro',
  'selected work',
  'experiences',
  "some cool things i've done in the past:",
  'how i started:',
  'where do i see myself in 10 years:',
]

/* Small caps eyebrow above each section — carries the hierarchy so the
   headings themselves can stay quiet. */
const EYEBROWS: Record<string, string> = {
  'selected work': 'Work',
  experiences: 'Experience',
  "some cool things i've done in the past:": 'Elsewhere',
}

export default function AboutRenderer({ content }: AboutRendererProps) {
  const [showMore, setShowMore] = useState(false)

  const parseAboutContent = (text: string) => {
    const sections = text.split('\n## ').filter((section) => section.trim())
    const parsedSections: Record<string, string> = {}

    sections.forEach((section) => {
      const lines = section.split('\n')
      const title = lines[0].replace('## ', '').trim()
      const sectionContent = lines.slice(1).join('\n').trim()
      parsedSections[title] = sectionContent
    })

    return parsedSections
  }

  const parseHoverLinks = (text: string) => {
    const processedText = text
      .replace(/^###\s*/gm, '')
      .replace(/^>\s*/gm, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[hover-rank\]([^[]+)\[\/hover-rank\]/g, (_match, rankContent) => {
        return `<span class="hover-rank-toggle group/rank cursor-default"><span class="group-hover/rank:hidden">${rankContent}</span><span class="hidden group-hover/rank:inline">2.5%</span></span>`
      })

    return processedText
      .replace(/\[hover-(\d+)\]\s*\[([^\]]+)\]\(([^)]+)\)/g, (_match, hoverNum, title, url) => {
        const linkClass = hoverClassMap[hoverNum] || 'link-blue'
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="${linkClass}">${title}</a>`
      })
      .replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, (_match, title, url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${title}</a>`
      })
  }

  const parseBulletPoints = (text: string, isListItem = false, key?: React.Key) => {
    const processedText = parseHoverLinks(text)

    if (isListItem) {
      return <li key={key} className="tight-list-item" dangerouslySetInnerHTML={{ __html: processedText }} />
    }

    return <span dangerouslySetInnerHTML={{ __html: processedText }} />
  }

  /* One block renderer for every section: paragraphs stay paragraphs,
     dash lists stay lists. No per-section special cases. */
  const renderBlocks = (body: string) =>
    body.split('\n\n').map((block, index) => {
      if (block.includes('\n- ') || block.trim().startsWith('- ')) {
        return (
          <ul key={index} className="list-none">
            {block
              .split('\n- ')
              .filter((item) => item.trim())
              .map((item, i) => parseBulletPoints(item.replace(/^- /, '').trim(), true, i))}
          </ul>
        )
      }
      return <p key={index}>{parseBulletPoints(block)}</p>
    })

  const Section = ({ eyebrow, title, body }: { eyebrow?: string; title: string; body: string }) => (
    <section className="section-block">
      {eyebrow && <span className="section-label">{eyebrow}</span>}
      <h2 className="section-title">{title}</h2>
      {renderBlocks(body)}
    </section>
  )

  const sections = parseAboutContent(content)
  const extraSections = Object.keys(sections).filter((key) => !KNOWN.includes(key))

  return (
    <div className="portfolio-content">
      {/* ── intro: one lede, then plain paragraphs. Nothing shouts. ── */}
      {sections.intro && (
        <section>
          {sections.intro.split('\n\n').map((paragraph, index) => {
            if (index === 0) {
              return (
                <span key={index} className="section-label section-label--lead">
                  {paragraph.replace(/\*/g, '')}
                </span>
              )
            }
            if (index === 1) {
              return (
                <p
                  key={index}
                  className="mb-8 font-instrument text-[24px] italic leading-[1.35] text-foreground sm:text-[27px]"
                >
                  {parseBulletPoints(paragraph)}
                </p>
              )
            }
            return <p key={index}>{parseBulletPoints(paragraph)}</p>
          })}
        </section>
      )}

      {sections['selected work'] && (
        <Section eyebrow={EYEBROWS['selected work']} title="selected work" body={sections['selected work']} />
      )}

      {sections.experiences && (
        <Section eyebrow={EYEBROWS.experiences} title="experience" body={sections.experiences} />
      )}

      {sections["some cool things i've done in the past:"] && (
        <Section
          eyebrow={EYEBROWS["some cool things i've done in the past:"]}
          title="a few other things"
          body={sections["some cool things i've done in the past:"]}
        />
      )}

      {/* any new "## heading" you add to about.md lands here automatically */}
      {extraSections.map((key) => (
        <Section key={key} title={key.replace(/:$/, '')} body={sections[key]} />
      ))}

      {(sections['how i started:'] || sections['where do i see myself in 10 years:']) && (
        <div className="section-block">
          <button
            onClick={() => setShowMore(!showMore)}
            aria-expanded={showMore}
            className="text-[13px] uppercase tracking-[0.18em] text-foreground/45 transition-colors hover:text-foreground"
          >
            {showMore ? 'Less' : 'More'}
          </button>

          {showMore && (
            <div className="mt-10 space-y-10">
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

      <div className="section-block">
        <FavoritePhotosCarousel />
      </div>
    </div>
  )
}