import React, { useState } from 'react'

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

export default function AboutRenderer({ content }: AboutRendererProps) {
  const [showMore, setShowMore] = useState(false)

  const parseAboutContent = (text: string) => {
    const sections = text.split('\n## ').filter(section => section.trim())
    const parsedSections: Record<string, string> = {}

    sections.forEach(section => {
      const lines = section.split('\n')
      const title = lines[0].replace('## ', '').trim()
      const sectionContent = lines.slice(1).join('\n').trim()
      parsedSections[title] = sectionContent
    })

    return parsedSections
  }

  const parseHoverLinks = (text: string) => {
    let processedText = text.replace(/\[hover-rank\]([^[]+)\[\/hover-rank\]/g, (_match, rankContent) => {
      return `<span class="hover-rank-toggle group/rank cursor-default"><span class="group-hover/rank:hidden">${rankContent}</span><span class="hidden group-hover/rank:inline">2.5%</span></span>`
    })

    return processedText.replace(/\[hover-(\d+)\]\s*\[([^\]]+)\]\(([^)]+)\)/g, (_match, hoverNum, title, url) => {
      const linkClass = hoverClassMap[hoverNum] || 'link-blue'
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="${linkClass}">${title}</a>`
    })
  }

  const parseBulletPoints = (text: string, isListItem = false) => {
    const processedText = parseHoverLinks(text)

    if (isListItem) {
      return (
        <li
          key={Math.random()}
          className="tight-list-item"
          dangerouslySetInnerHTML={{ __html: processedText }}
        />
      )
    }

    return <span dangerouslySetInnerHTML={{ __html: processedText }} />
  }

  const sections = parseAboutContent(content)

  return (
    <div className="text-sm">
      {sections.intro && (
        <div className="mb-4">
          {sections.intro.split('\n\n').map((paragraph, index) => (
            <p key={index} className={index > 0 ? "mt-2" : ""}>
              {parseBulletPoints(paragraph)}
            </p>
          ))}
        </div>
      )}

      {sections["some cool things i've done in the past:"] && (
        <div className="mb-4">
          <h2 className="mb-2 font-normal text-base" style={{ fontFamily: '"Newsreader", Georgia, serif' }}>
            some cool things i've done in the past:
          </h2>
          <ul className="list-none space-y-1 text-base">
            {sections["some cool things i've done in the past:"]
              .split('\n- ')
              .filter(item => item.trim())
              .map((item) => {
                const cleanItem = item.replace(/^- /, '').trim()
                return parseBulletPoints(cleanItem, true)
              })}
          </ul>
        </div>
      )}

      {(sections["how i started:"] || sections["where do i see myself in 10 years:"]) && (
        <button
          onClick={() => setShowMore(!showMore)}
          className="text-sm underline hover:no-underline mb-4"
        >
          {showMore ? 'Show Less' : 'Read More'}
        </button>
      )}

      {showMore && (
        <div className="space-y-4">
          {sections["how i started:"] && (
            <div>
              <h2 className="mb-2 font-bold text-sm">how i started:</h2>
              <p className="mb-2">{parseBulletPoints(sections["how i started:"].split('\n\n')[0])}</p>
              <ul className="list-none space-y-1 text-sm">
                {sections["how i started:"]
                  .split('\n- ')
                  .slice(1)
                  .filter(item => item.trim())
                  .map((item) => parseBulletPoints(item.replace(/^- /, '').trim(), true))}
              </ul>
            </div>
          )}

          {sections["where do i see myself in 10 years:"] && (
            <div>
              <h2 className="mb-2 font-bold text-sm">where do i see myself in 10 years:</h2>
              <p>{parseBulletPoints(sections["where do i see myself in 10 years:"])}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
