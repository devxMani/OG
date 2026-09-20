"use client"

import type React from "react"
import { useEffect, useState } from "react"
import FavoritePhotosCarousel from "@/components/favorite-photos-carousel"
import { ScrollProgressIndicator } from "@/components/scroll-progress-indicator"
import { HookSidebar } from "@/components/ui/hook-sidebar"
import Link from "next/link"
import { AccentControls } from "@/components/accent-controls"
import { useAccentTheme } from "@/components/accent-theme-provider"
import { cn } from "@/lib/utils"
import GridReveal from "@/components/ui/grid-reveal"
import type { SubstackArticle } from "@/lib/substack"
import MDXRenderer from "@/components/mdx-renderer"
import ContentRenderer from "@/components/content-renderer"
import AboutRenderer from "@/components/about-renderer"
import ContentWorthConsumingRenderer from "@/components/content-worth-consuming-renderer"
import { Bookshelf } from "@/components/bookshelf"
import type { Book } from "@/lib/books"
import CommandPalette from "@/components/command-palette"
import { SiteFooter } from "@/components/site-footer"
import KeyboardHint from "@/components/keyboard-hint"
import HeroBanner from "@/components/hero-banner"
import { HeroVideo } from "@/components/hero-video"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, User, BookOpen, Heart, Bookmark, Search } from "lucide-react"

const SECTIONS = ["about", "fieldnotes", "inspirations", "content", "bookshelf", "photos"] as const
type SectionKey = (typeof SECTIONS)[number]

const NAV_ITEMS: { key: SectionKey; label: string }[] = [
  { key: "about", label: "about" },
  { key: "fieldnotes", label: "blogs & fieldnotes" },
  { key: "inspirations", label: "my philosophy" },
  { key: "content", label: "content worth consuming" },
  { key: "bookshelf", label: "bookshelf" },
]

type ProjectKey = "tensorforest" | "apocalypse-hacks"

interface ClientHomeProps {
  fieldnotes: SubstackArticle[]
  philosophy: any
  contentWorthConsuming: any
  about: any
  books?: Book[]
  lastUpdated: string
  initialSection?: SectionKey | "projects"
  initialProject?: ProjectKey
}

export default function ClientHome({
  fieldnotes,
  philosophy,
  contentWorthConsuming,
  about,
  books = [],
  lastUpdated,
  initialSection = "about",
  initialProject,
}: ClientHomeProps) {
  /* ────────────────────────────────
     section definitions
  ────────────────────────────────── */
  const resolvedInitialSection: SectionKey =
    initialSection && (SECTIONS as readonly string[]).includes(initialSection)
      ? (initialSection as SectionKey)
      : "about"
  const [activeSection, setActiveSection] = useState<SectionKey>(resolvedInitialSection)
  const [showTensorForest, setShowTensorForest] = useState(false)
  const [activeTensorForest, setActiveTensorForest] = useState(initialProject === "tensorforest")
  const [activeApocalypseHacks, setActiveApocalypseHacks] = useState(initialProject === "apocalypse-hacks")
  const [activePhotoTab, setActivePhotoTab] = useState<'polaroids' | 'digital' | 'film'>('polaroids')
  const [projectFilter, setProjectFilter] = useState<'Everything' | 'Projects' | 'Communities'>('Everything')
  const [introGreeting, setIntroGreeting] = useState("Hi, I’m")
  const { accentDark, accentVibrant, resolvedTheme, theme } = useAccentTheme()
  const navAccent = (resolvedTheme || theme) === "dark" ? accentDark : accentVibrant
  const activeNavIndex = Math.max(0, NAV_ITEMS.findIndex((item) => item.key === activeSection))

  useEffect(() => {
    const greetings = [
      "Hi, I’m",
      "你好，我是",
      "Bonjour, je suis",
      "Ciao, sono",
      "Hola, soy",
      "שלום, אני",
      "नमस्ते, मैं हूँ",
      "Привет, я",
      "Olá, eu sou",
    ]
    let index = 0
    const interval = window.setInterval(() => {
      index += 1
      if (index >= greetings.length) index = 0
      setIntroGreeting(greetings[index])
    }, 330)
    const stop = window.setTimeout(() => {
      window.clearInterval(interval)
      setIntroGreeting("Hi, I’m")
    }, 3000)
    return () => {
      window.clearInterval(interval)
      window.clearTimeout(stop)
    }
  }, [])
  /* ────────────────────────────────
     helpers
  ────────────────────────────────── */
  const selectSection = (section: SectionKey) => {
    setActiveSection(section)
    // Always reset detail views when selecting a section
    // This ensures clicking "projects" from detail pages goes to main projects page
    setActiveTensorForest(false)
    setActiveApocalypseHacks(false)
    // Reset photo tab to default when switching sections
    setActivePhotoTab('polaroids')
  }

  const selectTensorForest = () => {
    setActiveTensorForest(true)
    setActiveApocalypseHacks(false)
  }

  const selectApocalypseHacks = () => {
    setActiveTensorForest(false)
    setActiveApocalypseHacks(true)
  }


  // Command palette handlers
  const handleCommandNavigation = (section: string) => {
    if (section === "projects" || section === "experience") {
      selectSection("about")
      return
    }
    if ((SECTIONS as readonly string[]).includes(section)) {
      selectSection(section as SectionKey)
    }
  }


  const handleCommandProject = (project: string) => {
    if (project === 'tensorforest') {
      selectTensorForest()
    } else if (project === 'apocalypse') {
      selectApocalypseHacks()
    }
  }

  // Experiences data for command palette
  const experiencesForCommandPalette = [
    { title: "RevisionDojo (YCF24)", type: "Internship" as const, link: "https://revisiondojo.com", image: "/revisiondojo.png" },
    { title: "tensorforest", type: "Project" as const, hasDetailPage: true, image: "/tensorforest.jpg" },
    { title: "performativepuritytest.com", type: "Project" as const, link: "https://performativepuritytest.com", image: "/performativepurity.png" },
    { title: "do-eve", type: "Project" as const, link: "https://devpost.com/software/do-eve", image: "/doeve.png" },
    { title: "coach bob", type: "Project" as const, link: "https://devpost.com/software/coach-bob", image: "/coachbob.jpg" },
    { title: "teen builders club", type: "Community" as const, image: "/teenbuildersclub.jpg" },
    { title: "white oaks robotics", type: "Community" as const, image: "/vex.jpg" },
    { title: "apocalypse hacks", type: "Community" as const, hasDetailPage: true, image: "/apoimages/vickyapo.png" },
    { title: "vibetype", type: "Project" as const, link: "https://www.gptfixtsfor.me/", image: "/vibetype.png" },
    { title: "shoppywrapped", type: "Project" as const, link: "https://github.com/ultratrikx/shoppy-wrapped/pulls", image: "/shoppy.png" },
  ]

  const handleSelectExperience = (experience: { title: string; type: string; link?: string; hasDetailPage?: boolean }) => {
    if (experience.title === 'tensorforest') {
      selectTensorForest()
    } else if (experience.title === 'apocalypse hacks') {
      selectApocalypseHacks()
    } else if (experience.link) {
      window.open(experience.link, '_blank', 'noopener,noreferrer')
    }
  }

  /* ────────────────────────────────
     render
  ────────────────────────────────── */
  return (
    <div className="min-h-screen bg-transparent text-foreground flex flex-col items-center pt-16 pb-12 px-4 sm:px-6 md:pt-6 lg:px-8 relative selection:bg-white/20">
      <div className="w-full flex flex-col items-center relative z-10">
        {/* ───────────── mobile top bar ───────────── */}
        <div className="md:hidden fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="flex items-center gap-1 bg-white/[0.06] dark:bg-black/40 backdrop-blur-xl rounded-full p-1 shadow-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const event = new KeyboardEvent('keydown', {
                  key: 'k',
                  metaKey: true,
                  bubbles: true
                })
                document.dispatchEvent(event)
              }}
              className="h-8 w-8 p-0 rounded-full"
            >
              <Search className="h-4 w-4" />
            </Button>
            <div className="w-px h-4 bg-foreground/15" />
            <Button
              variant={activeSection === 'about' && !activeTensorForest && !activeApocalypseHacks ? "default" : "ghost"}
              size="sm"
              onClick={() => selectSection('about')}
              className="h-8 w-8 p-0 rounded-full"
              data-cuelume-press="tick"
            >
              <User className="h-4 w-4" />
            </Button>
            <Button
              variant={activeSection === 'fieldnotes' ? "default" : "ghost"}
              size="sm"
              onClick={() => selectSection('fieldnotes')}
              className="h-8 w-8 p-0 rounded-full"
              data-cuelume-press="tick"
            >
              <BookOpen className="h-4 w-4" />
            </Button>
            <Button
              variant={activeSection === 'inspirations' && !activeTensorForest && !activeApocalypseHacks ? "default" : "ghost"}
              size="sm"
              onClick={() => selectSection('inspirations')}
              className="h-8 w-8 p-0 rounded-full"
              data-cuelume-press="tick"
            >
              <Heart className="h-4 w-4" />
            </Button>
            <Button
              variant={activeSection === 'content' && !activeTensorForest && !activeApocalypseHacks ? "default" : "ghost"}
              size="sm"
              onClick={() => selectSection('content')}
              className="h-8 w-8 p-0 rounded-full"
              data-cuelume-press="tick"
            >
              <Bookmark className="h-4 w-4" />
            </Button>
            <Button
              variant={activeSection === 'bookshelf' && !activeTensorForest && !activeApocalypseHacks ? "default" : "ghost"}
              size="sm"
              onClick={() => selectSection('bookshelf')}
              className="h-8 w-8 p-0 rounded-full"
              data-cuelume-press="tick"
            >
              <BookOpen className="h-4 w-4" />
            </Button>
            <Button
              variant={activeSection === 'photos' && !activeTensorForest && !activeApocalypseHacks ? "default" : "ghost"}
              size="sm"
              onClick={() => selectSection('photos')}
              className="h-8 w-8 p-0 rounded-full"
              data-cuelume-press="tick"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </Button>
          </div>
        </div>

        {/* desktop theme control in top right */}
        <div className="hidden md:block absolute top-4 right-4 z-50">
          <AccentControls embedded />
        </div>
        <AccentControls />

        {/* Hero Video */}
        <div className="max-w-6xl w-full mb-8 md:mb-10">
          <HeroVideo />
        </div>

        <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-[180px_minmax(0,1fr)] gap-10 md:gap-12 font-newsreader text-[16px] items-start">
          <nav className="hidden md:block self-start select-none pt-1">
            <HookSidebar
              items={NAV_ITEMS.map((item) => item.label)}
              value={activeNavIndex}
              onChange={(index) => {
                const next = NAV_ITEMS[index]
                if (next) selectSection(next.key)
              }}
              color={navAccent}
              className="font-newsreader text-[15px] tracking-[0.01em]"
            />
            <nav aria-label="Social links" className="mt-8 flex items-center gap-3 border-t border-foreground/10 pt-4 text-muted-foreground">
              <a href="https://x.com/" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-foreground" aria-label="X / Twitter">x</a>
              <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-foreground" aria-label="GitHub">github</a>
              <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-foreground" aria-label="LinkedIn">linkedin</a>
              <a href="mailto:your@email.com" className="transition-colors hover:text-foreground" aria-label="Email">email</a>
            </nav>
          </nav>
          <div className="portfolio-content text-base leading-relaxed min-w-0">
            {activeTensorForest ? renderTensorForestContent() : 
             activeApocalypseHacks ? renderApocalypseHacksContent() : 
             renderSectionContent(activeSection)}

            <SiteFooter lastUpdated={lastUpdated} />
          </div>


        </div>

        <ScrollProgressIndicator
          sections={NAV_ITEMS.map((item) => ({ id: `section-${item.key === "fieldnotes" ? "blogs" : item.key === "inspirations" ? "philosophy" : item.key}`, label: item.label }))}
        />

        {/* Command Palette */}
        <CommandPalette
          fieldnotes={fieldnotes}
          experiences={experiencesForCommandPalette}
          onNavigate={handleCommandNavigation}
          onSelectProject={handleCommandProject}
          onSelectExperience={handleSelectExperience}
          currentSection={activeSection}
          currentPage="Home"
        />
      </div>
    </div>
  )


  /* ───────�������────────────────────────
     render tensorforest content
  ─�����──────────────────���───────────── */
  function renderTensorForestContent() {
    return (
      <div>
        {/* Title */}
        <h1 className="text-4xl font-bold mb-2">TensorForest</h1>
        <p className="text-muted-foreground mb-8">Autonomous drone system for wildfire prediction and prevention</p>

        {/* The Problem */}
        <div className="mb-10">
          <h2 className="text-2xl mb-4">The Problem</h2>
          <p className="mb-6">
            Wildfires have become increasingly frequent and severe, devastating forest ecosystems and contributing significantly to greenhouse gas emissions. The UN Environment Programme (UNEP) predicts a global rise in extreme wildfires by 14% by 2030, 30% by 2050, and 50% by 2100. Climate change and wildfires form a dangerous feedback loop, worsening the damage and increasing the need for fire prevention.
          </p>

          <h2 className="text-2xl mb-4">The Opportunity</h2>
          <p className="mb-6">
            Effective wildfire prevention requires accurate, up to date/real-time data. However, current solutions have big limitations:
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-1">
            <li>
              <span className="font-medium">Expensive drones</span>: High-end wildfire monitoring drones cost $25,000 or more, making them inaccessible to many organizations and communities.
            </li>
            <li>
              <span className="font-medium">Manual surveying</span>: Traditional forest monitoring methods are slow, labor-intensive, and costly.
            </li>
            <li>
              <span className="font-medium">Limited access</span>: Fire departments in wealthier nations have access to advanced technology, while vulnerable communities, such as farmers in Kenya, Indonesia, and Vietnam, lack affordable wildfire prevention tools.
            </li>
            <li>
              <span className="font-medium">Satellite imagery limitations</span>: Satellites do not provide high-resolution, up-to-date data necessary for proactive fire prevention.
            </li>
          </ul>
        </div>

        {/* How It Works */}
        <div className="mb-10">
          <h2 className="text-2xl mb-4">How It Works</h2>
          <p className="mb-6">
            TensorForest is an autonomous drone system designed to provide high-resolution forest monitoring and wildfire prediction. The process includes:
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-1">
            <li>
              <span className="font-medium">Selecting a target region</span> for assessment.
            </li>
            <li>
              <span className="font-medium">Generating a flight plan</span> to autonomously cover the area.
            </li>
            <li>
              <span className="font-medium">Capturing multiple high-resolution images and spatial data</span>.
            </li>
            <li>
              <span className="font-medium">Stitching images together using OpenCV</span> to create a detailed forest map.
            </li>
            <li>
              <span className="font-medium">Generating a Digital Elevation Model (DEM)</span> by processing spatial points.
            </li>
            <li>
              <span className="font-medium">Running the data through a vision transformer model</span>, integrating climate data such as temperature and precipitation.
            </li>
            <li>
              <span className="font-medium">Producing a wildfire risk heat map</span>, classifying vegetation and identifying high-risk areas/how fire is likely to spread based on detected forest fire lines.
            </li>
            <li>
              <span className="font-medium">Utilizing data for fire prevention planning</span>, helping determine optimal locations to cut fire lines and mitigate wildfire spread.
            </li>
          </ul>
        </div>

        {/* Current Development & Funding Needs */}
        <div className="mb-10">
          <h2 className="text-2xl mb-4">Current Development & Funding Needs</h2>
          <p className="mb-6">
            We are actively seeking microgrants and funding to enhance TensorForest's capabilities:
          </p>
          <ol className="list-decimal pl-6 mb-6 space-y-2">
            <li>
              <span className="font-medium">Scaling hardware and software</span>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Acquiring higher-resolution LiDAR sensors for improved accuracy.</li>
                <li>Developing longer-range drones for large-scale forest monitoring.</li>
              </ul>
            </li>
            <li>
              <span className="font-medium">Enhancing AI Model Accuracy</span>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>
                  Continuing to train and refine the wildfire risk assessment model, requiring more computing power and diverse datasets for improved accuracy.
                </li>
              </ul>
            </li>
          </ol>

        </div>
      </div>
    )
  }

  /* ────────────────────────────────
     render apocalypse hacks content
  ────────────────────────────────── */
  function renderApocalypseHacksContent() {
    return (
      <div>
        {/* Title */}
        <h1 className="text-4xl font-bold mb-2">Apocalypse Hacks</h1>
        <p className="text-muted-foreground mb-8">Canada's largest high school hackathon</p>

        {/* Summary */}
        <div className="mb-10">
          <h2 className="text-2xl mb-4">Summary</h2>
          <p className="mb-6">
            Apocalypse Hacks is Canada's largest high school hackathon (as of March 2025). It took place from{" "}
            <span className="font-semibold">May 17-19, 2024</span>, at Shopify's Toronto office. We brought together 150+ high schoolers,
            and in just 36 hours, they built 40+ projects, including everything from a peashooter to Uber for automated drones.
          </p>

          <h2 className="text-2xl mb-4">Team</h2>
          <p className="mb-6">
            <a href="https://aconlin.vercel.app/" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Acon Lin</a>,{" "}
            <a href="https://www.radioblahaj.com/?ref=apocalypse" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Arav Narula</a>,{" "}
            <a href="https://www.mutammim.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Mutammim Sarkar</a>,{" "}
            <a href="https://www.linkedin.com/in/shayaan-azeem/" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Shayaan Azeem</a>,{" "}
            <a href="https://limeskey.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Ryan Di Lorenzo</a>,{" "}
            <a href="https://www.linkedin.com/in/gregory-gu-b777212ba/" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Gregory Gu</a>,{" "}
            <a href="https://samliu.dev/" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Sam Liu</a>,{" "}
            <a href="https://www.linkedin.com/in/sarvesh-mohan-kumar-a009ba268/" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Sarvesh Mohan Kumar</a>,{" "}
            <a href="http://evelynw.ong/" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Evelyn Wong</a>,{" "}
            <a href="https://www.linkedin.com/in/vivian-yuan-240716284/" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Vivian Yuan</a>
          </p>

          <h2 className="text-2xl mb-4">Why Did We Build This?</h2>
          <p className="mb-6">
            As someone who's been interested in hacking and building things for most of my high school life, I have often found myself
            yearning for a sense of community and belonging. Toronto, though it may be a hub of innovation, really doesn't and didn't have many
            opportunities for high schoolers interested in tech and building things. Now, yes, there are some hackathons hosted here and there,
            but nothing out of the ordinary. If you go to those events, you find no sense of purpose or fulfillment because everyone is there
            to pad their resumes…
          </p>
          <p className="mb-6">
            That realization led to Apocalypse Hacks. We wanted to create a space for like-minded high schoolers to come together and build
            cool sh*t. And I think we did that.
          </p>
        </div>

        {/* The Journey */}
        <div className="mb-10">
          <h2 className="text-2xl mb-4">The Journey</h2>
          <p className="mb-6">
            I joined the core team in early 2024. At that point, we were actively looking for sponsors and a venue, and we cold emailed a
            LOT. We got a ton of nos and maybes, but finally, Shopify said yes, and the rest? Well, that was history.
          </p>

          <h2 className="text-2xl mb-4">Timeline of Talks with Shopify</h2>
          <p className="mb-4">
            This was definitely a lengthy process, and during this, we were still actively reaching out to other people and companies:
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-1">
            <li>Jan 8 - Original email to Tobi</li>
            <li>Jan 11 - Follow-up #1 with Tobi</li>
            <li>Jan 15 - Original email to Tobi's EA</li>
            <li>Jan 16 - Follow-up #2 with Tobi (oops)</li>
            <li>Feb 13 - Email to Shopify eng person</li>
            <li>Feb 14 - Reply from someone else at Shopify</li>
            <li>Feb 20 - Exploratory call</li>
            <li>Feb 23 - Reply: "positive conversations"</li>
            <li>Feb 28 - Reply: "mostly approved"</li>
            <li>Mar 1 - Reply: "getting closer..."</li>
            <li>Mar 6 - Confirmation from Shopify!!!</li>
            <li>Mar 8 - We're actually gonna make this happen call!</li>
            <li>Mar 14 - Speaking with the event producer (shoutout to Jennifer for all the help) + visiting the venue</li>
          </ul>
        </div>

        {/* March 14 - The First Look at Shopify */}
        <div className="mb-10">
          <h2 className="text-2xl mb-4">March 14 - The First Look at Shopify</h2>
          <p className="mb-6">
            Walking into Shopify's Toronto HQ for the first time was surreal. It was everything we could've wanted and even more. The venue was
            huge, it had amazing views of the city, the CN Tower—it felt like the space motivated us even more than we already were.
          </p>
        </div>

        {/* Money Problems & Hack Club */}
        <div className="mb-10">
          <h2 className="text-2xl mb-4">I Got 99 Problems, and Money is the Biggest One</h2>
          <p className="mb-6">
            The next week, we sent even more emails, got meetings with some big Canadian companies and banks, and kept grinding. Then, Hack
            Club reached out…
          </p>
          <p className="mb-6">
            They had been keeping an eye on what we were building, and seeing us secure Shopify as a venue convinced them that we were legit.
            They offered to fully acquire the event as their spring hackathon and back it with $35K USD.
          </p>

          <h2 className="text-2xl mb-4">April 2, 2024</h2>
          <p className="mb-6">
            At first, we weren't sure. But after talking it through, we realized this was the best thing that could've happened. Hack Club
            stood for the same values we did—empowering youth to build things they want to. It just made sense.
          </p>
          <p className="mb-6">
            With money in hand, we got to work. I built a Trello board with auto-assignments, time tracking, and Slack integration, which
            would be the basis of all this.
          </p>
        </div>

        {/* Organizing the Event */}
        <div className="mb-10">
          <h2 className="text-2xl mb-4">Organizing the Event</h2>
          <p className="mb-6">
            Over the next few weeks, #apo-core on Slack became our home base. This is where we figured out:
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-1">
            <li>Food (Poke bowls, Michelin-star donuts, boba)</li>
            <li>Custom PCB Badges (which, lol, didn't even arrive on time, but that's a story for another day)</li>
            <li>Snacks, Merch, Stickers, Shirts</li>
            <li>Caffeine Planning - We very proudly had more Red Bull and Awake at our high school hackathon than Hack the North managed to get for Canada's largest hackathon (weird flex, but okay, I know).</li>
            <li>Vendor Outreach - I remember getting responses from Chinese vendors on Alibaba at 4 AM hahah.</li>
          </ul>

          <p className="mb-6">
            From March to May 17th, we barely slept. There were 2 AM Slack calls on school nights, all-day Saturday meetings, and a
            ridiculous amount of last-minute scrambling. But somehow, we made it happen.
          </p>
        </div>

        {/* How We Organized */}
        <div className="mb-10">
          <h2 className="text-2xl mb-4">How We Organized (we were just built different tho lol)</h2>
          <p className="mb-4">
            Most hackathons have subteams, divisions, committees. We did not.
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-1">
            <li>
              <span className="font-medium">No Specified Roles</span> - People just took on what they were good at (me? Logistics,
              Branding/Marketing, Media, and a whole bunch of whatever else we needed, etc.).
            </li>
            <li>
              <span className="font-medium">Team-wide Stand-up Meetings</span> - NOT split by divisions or clusters. This allowed everyone to
              be in the loop and understand where we were all at.
            </li>
            <li>
              <span className="font-medium">Small but Agile Team</span> - Our team was 7-8 people until the very end when it became 10. Even
              at this scale, we remained agile, working in sync, sharing tasks, and being responsible for our own things much more easily.
              There was no redundancy, no one to report to, no stupid chains of command.
            </li>
            <li>
              <span className="font-medium">Idea-Driven Culture</span> - Anyone could pitch an idea. If you had something cool in mind
              and could pull it off, you just… did it. No approval process, no gatekeeping. I credit this ideology to Hack Club, but it was
              really instilled all throughout the team. I also credit{" "}
              <a
                href="https://aconlin.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Acon
              </a>{" "}
              for leading by actually doing this! So many of our best ideas, like the card game and bottle cap currency, came from random
              late night Slack messages.
            </li>
          </ul>

          <h2 className="text-2xl mb-4">The Takeaway</h2>
          <p className="mb-6">
            If you have the ability to make it and think it's worth it to do so, then make it. Don't worry about semantics like titles and
            experience. The best way to learn is by doing. None of us actually knew how to do any of this beforehand, but it's probably more
            efficient to learn by doing, then breaking it, then building it again.
          </p>
        </div>

        {/* The Hackathon */}
        <div className="mb-10">
          <h2 className="text-2xl mb-4">May 17-19: The Hackathon</h2>
          <p className="mb-6">
            It was so crazy. Some things went wrong, some went well, but a lot went even better than we had planned. We had a full house—EVERY
            PERSON WHO SIGNED UP (with the exception of one) showed up. 150+ hackers. 36 hours. 40+ projects. Absolute insanity.
          </p>
          <p className="mb-6">
            I'm so grateful for everyone who attended and shipped a project! It was so cool to meet everyone and people with the same interests
            as me. Like I said in the beginning, we set out to create a place to meet our people, and we definitely did just that.
          </p>

          <p className="mb-4 text-center">
            Check out this documentary I made to recap the event! :)
          </p>
          <div className="flex justify-center my-8">
            <iframe
              width="560"
              height="315"
              src="https://www.youtube.com/embed/QvCoISXfcE8"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          <div className="flex justify-center my-8">
            <iframe
              style={{ borderRadius: "12px", border: "none" }}
              src="https://open.spotify.com/embed/track/1oAwsWBovWRIp7qLMGPIet?utm_source=generator"
              width="80%"
              height="152"
              allowFullScreen
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </div>
    )
  }

  /* ────────────────────────────────
     render section content
  ────────────────────────────────── */
  function renderSectionContent(section: SectionKey) {
    const boldHeadings = [
      "how i started:",
      "some cool things i've done in the past:",
      "where do i see myself in 10 years:",
      "projects",
      "content worth consuming imo:",
      "my philosophy:"
    ]

    const renderWithHeading = (title: string, content: React.ReactNode) => (
      <div className="pt-2">
        <h2 className={cn("text-4xl font-bold mb-8", boldHeadings.includes(title) && "font-bold")}>
          {title}
        </h2>
        {content}
      </div>
    )

    switch (section) {
      case "about":
        return (
          <div id="section-about" className="scroll-mt-8">
            {/* Name and Social Icons */}
            <div className="relative mb-2 min-h-[3.25rem]">
              <h1 className="flex items-baseline gap-3 whitespace-nowrap font-instrument text-[30px] leading-none font-normal italic tracking-tight sm:text-[36px]">
                <span className="inline-block transition-opacity duration-200" aria-live="polite">
                  {introGreeting}
                </span>
                <span>Mani</span>
              </h1>
              <div className="absolute right-4 top-0 w-20 sm:w-24">
                <GridReveal
                  src="/mani-profile.jpeg"
                  alt="Portrait of Mani"
                  aspect={1}
                  estimatedDuration={2600}
                  className="rounded-sm"
                />

              </div>
            </div>
            
            {/* Dynamic About Content */}
            {about ? (
              <AboutRenderer content={about.content} />
            ) : (
              <p className="text-muted-foreground">No about content available.</p>
            )}
          </div>
        )

      case "fieldnotes":
        return (
          <div className="pt-2" id="section-blogs">
            <h2 className="text-4xl font-bold mb-4">blogs & fieldnotes</h2>
            <p className="text-lg text-muted-foreground mb-8">
              thoughts, observations, and learnings from my journey
            </p>
            
            {fieldnotes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">no fieldnotes yet</p>
              </div>
            ) : (
              <div className="space-y-6">
                {fieldnotes.map((item) => (
                  <a
                    key={item.slug}
                    id={`note-${item.slug}`}
                    href={item.substackUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-left transition-all duration-200 cursor-pointer group scroll-mt-24"
                  >
                    <div className="relative h-48 overflow-hidden transition-all duration-300 group-hover:h-56">
                      {/* Background Image */}
                      {item.banner ? (
                        <img 
                          src={item.banner} 
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-gray-700 to-gray-900" />
                      )}
                      
                      {/* Dark gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/30"></div>
                      
                      {/* Content overlay */}
                      <div className="absolute inset-0 flex flex-col justify-end p-6">
                        <div className="text-white">
                          <h3 className="text-2xl font-bold mb-2 group-hover:text-white/90 transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-white/90 text-sm mb-3 line-clamp-2">
                            {item.summary}
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="text-white/70 text-sm">
                              {new Date(item.date).toLocaleDateString('en', { 
                                month: 'short', 
                                year: 'numeric' 
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        )

      case "inspirations":
        return (
          <div className="pt-2" id="section-philosophy">
            {philosophy ? (
              <div className="text-justify">
              <MDXRenderer item={philosophy} />
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold mb-4">My Philosophy</h2>
                <p className="text-muted-foreground">Philosophy content not found. Create a philosophy.md file in the content directory.</p>
              </div>
            )}
          </div>
        )
      case "content":
        return (
          <div className="pt-2" id="section-content">
            {contentWorthConsuming ? (
              <div className="mb-16">
                <h2 className="text-4xl font-bold mb-8">{contentWorthConsuming.title}</h2>
                <ContentWorthConsumingRenderer content={contentWorthConsuming.content} />
              </div>
            ) : (
              <div className="mb-16">
                <h2 className="text-4xl font-bold mb-8">Content Worth Consuming</h2>
                <p className="text-muted-foreground">Content not found. Create a content-worth-consuming.md file in the content directory.</p>
              </div>
            )}
          </div>
        )

      case "bookshelf":
        return (
          <div className="pt-2" id="section-bookshelf">
            <Bookshelf books={books} />
          </div>
        )

      case "photos":
        return renderPhotosContent()

      default:
        return null
    }
  }

  /* ────────────────────────────────
     render projects content
  ────────────────────────────────── */
  function renderProjectsSection() {
    interface Project {
      title: string;
      type: 'Internship' | 'Project' | 'Community';
      image: string;
      description: React.ReactNode;
      badge?: {
        text: string;
        className: string; // Using className to apply highlight classes
      };
      year?: string;
      link?: string;
      action?: () => void;
      tags?: string[]; // Keeping tags for optional additional details
    }

    const allProjects: Project[] = [
      {
        title: "RevisionDojo (YCF24)",
        type: "Internship",
        image: "/revisiondojo.png",
        description: "over fall 2025, I worked at RevisionDojo as a software engineer. built and shipped new features used by 600k+ students. learnt a lot and worked with some of the coolest people.",
        link: "https://revisiondojo.com"
      },
      {
        title: "tensorforest",
        type: "Project",
        image: "/tensorforest.jpg",
        description: "drones that find early forest fire risks. used remote sensing, NDVI, and onboard ML to detect dangerous vegetation zones and generate orthomosaic risk maps before fires start. worked with the town of oakville to test it.",
        action: selectTensorForest
      },
      {
        title: "performativepuritytest.com",
        type: "Project",
        image: "/performativepurity.png",
        description: <>shipped a performative purity test that mixed the summer's "performative" trend with the rice purity test. accidentally went viral and <a href="https://x.com/i/trending/1990747485631860858" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">trended on twitter for two days.</a></>,
        badge: { text: "300k+ users", className: "link-hackclub" },
        link: "https://performativepuritytest.com"
      },
      {
        title: "do-eve",
        type: "Project",
        image: "/doeve.png",
        description: "poke but for computer use. built an imessage agent that can use your laptop for you. opens apps, runs scripts, organizes files, and handles random tasks just by texting it.",
        badge: { text: "won hackprinceton", className: "link-teenbuilders" },
        link: "https://devpost.com/software/do-eve"
      },
      {
        title: "coach bob",
        type: "Project",
        image: "/coachbob.jpg",
        description: "built street fighter but irl. an AR pose based fighting game where you hit targets and get scored in real time. used gemini to give audio feedback and help you train.",
        badge: { text: "won hackthenorth", className: "link-bloomberg" },
        link: "https://devpost.com/software/coach-bob"
      },
      {
        title: "teen builders club",
        type: "Community",
        image: "/teenbuildersclub.jpg",
        description: "made the community I always wanted. hosted weekly coworking, demo nights, and built a space for ambitious young people to meet each other and actually build."
      },
      {
        title: "white oaks robotics",
        type: "Community",
        image: "/vex.jpg",
        description: "started and scaled my school's robotics team to 100+ members. built competitive robots, won the excellence award 5 times, and ranked top 62/2400 worldwide. handled design reviews, programming, scouting, and ops.",
        badge: { text: "2nd in Ontario", className: "link-robotics" }
      },
      {
        title: "apocalypse hacks",
        type: "Community",
        image: "/apoimages/vickyapo.png",
        description: "started canada's largest high school hackathon with 150 attendees and 40+ projects shipped. zombie apocalypse theme. raised 50k from shopify, doordash, and others. handled outreach, ops, sponsorships, and everything in between.",
        action: selectApocalypseHacks
      },
      {
        title: "uwaterloo.network",
        type: "Project",
        image: "/uwaterloonetwork.png",
        description: "i built a webring for waterloo friends :)",
        link: "https://uwaterloo.network"
      },
      {
        title: "shoppywrapped",
        type: "Project",
        image: "/shoppy.png",
        description: "spotify wrapped but for your shopping. built with shopify's shop mini framework. shows your top shops, spending, and order history in a clean stories style recap. won the shopify toronto tech week hackathon.",
        badge: { text: "won shopify hackathon", className: "link-olympiad" },
        link: "https://github.com/ultratrikx/shoppy-wrapped/pulls"
      },
      {
        title: "vibetype",
        type: "Project",
        image: "/vibetype.png",
        description: "built \"dia but for arc\" before dia had sidebar tabs. an ai writing sidekick that lives in your browser. highlight text to rewrite, expand, or clean it instantly. the sidebar reads your open tabs so it can help you draft way faster.",
        link: "https://www.gptfixtsfor.me/"
      }
    ];

    const filteredProjects = projectFilter === 'Everything' 
      ? allProjects 
      : allProjects.filter(p => {
          if (projectFilter === 'Projects') return p.type === 'Project';
          if (projectFilter === 'Communities') return p.type === 'Community';
          return p.type === projectFilter;
        });

    return (
      <div>
        {/* Filter Buttons and Search */}
        <div className="hidden md:flex justify-between items-center mb-6">
          <div className="flex flex-wrap gap-2.5">
            {['Everything', 'Projects', 'Communities'].map((filter) => (
              <button
                key={filter}
                onClick={() => setProjectFilter(filter as any)}
                className={cn(
                  "px-4 py-1.5 text-xs font-medium transition-all duration-200 rounded-full",
                  projectFilter === filter 
                    ? "glass-pill is-active text-foreground font-semibold" 
                    : "glass-pill text-muted-foreground/70 hover:text-foreground"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              const event = new KeyboardEvent('keydown', {
                key: 'k',
                metaKey: true,
                bubbles: true
              })
              document.dispatchEvent(event)
            }}
            className="text-muted-foreground hover:text-foreground transition-colors p-2"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map((project, index) => (
            <div 
              key={index} 
              className="glass-card p-3.5 rounded-2xl flex flex-col group transition-all duration-300 hover:translate-y-[-2px]"
            >
              {/* Image Container */}
              <div 
                className="relative mb-3.5 overflow-hidden aspect-[16/10] cursor-pointer rounded-xl bg-muted/20"
                onClick={() => {
                  if (project.action) project.action();
                  else if (project.link) window.open(project.link, '_blank');
                }}
              >
                <img 
                  src={project.image} 
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Content */}
              <div className="flex flex-col px-1 pb-1">
                <div className="flex justify-between items-start mb-1.5">
                  <h3 className="text-base font-medium leading-tight group-hover:text-foreground transition-colors">{project.title}</h3>
                  {project.badge && (
                    <span className={cn("text-[10px] font-medium ml-2 shrink-0 px-2 py-0.5 rounded-full glass-pill", project.badge.className)}>
                      {project.badge.text}
                    </span>
                  )}
                  {!project.badge && (
                    <span className="text-xs text-muted-foreground/70 ml-2 shrink-0">
                      {project.type === 'Community' ? 'community' : project.type.toLowerCase()}
                    </span>
                  )}
                </div>
                
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {project.tags && project.tags.length > 0 && (
                    <span className="block mb-1 text-[10px] opacity-70">{project.tags.join(', ')}</span>
                  )}
                  {project.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  /* ────────────────────────────────
     render photos content
  ─────────────────────────────────��� */
  function renderPhotosContent() {
    
    // Polaroid photos
    const polaroidPhotos = [
      {
        id: "home-1",
        title: "home, briefly",
        location: "Toronto, ON",
        image: "/cooked/homephotos/photo1.jpg",
      },
      {
        id: "home-2",
        title: "a quiet afternoon",
        location: "Toronto, ON",
        image: "/cooked/homephotos/photo2.jpg",
      },
      {
        id: "home-3",
        title: "somewhere familiar",
        location: "Toronto, ON",
        image: "/cooked/homephotos/photo3.jpg",
      },
      {
        id: "home-4",
        title: "on the way",
        location: "Toronto, ON",
        image: "/cooked/homephotos/photo4.jpg",
      },
      {
        id: "home-5",
        title: "the view from here",
        location: "Toronto, ON",
        image: "/cooked/homephotos/photo5.jpg",
      },
      {
        id: "home-6",
        title: "late light",
        location: "Toronto, ON",
        image: "/cooked/homephotos/photo6.jpg",
      },
      {
        id: "home-7",
        title: "until next time",
        location: "Toronto, ON",
        image: "/cooked/homephotos/photo7.jpg",
      },
      /*
      {
        id: "2",
        title: "apocalypse w/ greg",
        location: "Shopify Toronto",
        image: "/polaroids/apogreg.png",
        songUrl: "https://open.spotify.com/track/0mEdbdeRFQwBhN4xfyIeUM?si=e6bb613c681245fd"
      },
      {
        id: "3",
        title: "lost in toronto",
        location: "Toronto, ON",
        image: "/polaroids/lost in toronto.png",
        songUrl: "https://open.spotify.com/track/5kDgJffgJ0lYHTSiaXFWNw?si=590001762a2840ce"
      },
      {
        id: "4",
        title: "the one where ayaan turns five",
        location: "Jersey City, NJ",
        image: "/polaroids/ayaanturns5.png",
        songUrl: "https://open.spotify.com/track/4I4aQGNJ2HufloNtB65nxR?si=c579a5e4bb6042c2"
      },
      {
        id: "5",
        title: "airplane thoughts",
        location: "Above Michigan",
        image: "/polaroids/airplanethoughts.png",
        songUrl: "https://open.spotify.com/track/19nu3H3vjeZ505i450lz8R?si=424f25c49b9f4b30"
      },
      {
        id: "6",
        title: "break things build better",
        location: "Shopify Toronto",
        image: "/polaroids/breakbuildbetter.png",
        songUrl: "https://open.spotify.com/track/1oAwsWBovWRIp7qLMGPIet?si=d9e5bb4900954ea5"
      },
      {
        id: "7",
        title: "water water water loo loo loo",
        location: "Waterloo, ON",
        image: "/polaroids/water water.png",
        songUrl: "https://open.spotify.com/track/1v0uVPU6BWcbog5BiWLWVa?si=0a01a3cab11149a9"
      },
      {
        id: "8",
        title: "robotics presidents!",
        location: "Oakville, ON",
        image: "/polaroids/nobel physic.PNG",
        songUrl: "https://open.spotify.com/track/7kv7zBjMtVf0eIJle2VZxn?si=997f5b3c5ef24430"
      },
      {
        id: "9",
        title: "777",
        location: "Toronto, ON",
        image: "/polaroids/777.png",
        songUrl: "https://open.spotify.com/track/32J2bR5gnepj9uHPGVGStr?si=84a55b42ab404585"
      },
      {
        id: "19",
        title: "ycombinator core",
        location: "Waterloo, ON",
        image: "/polaroids/water water water.png",
        songUrl: "https://open.spotify.com/track/1Ukxccao1BlWrPhYkcXbwZ?si=9fee189e2ea547bb"
      },
      {
        id: "11",
        title: "dumbo!",
        location: "New York City, NY",
        image: "/polaroids/dumbo.png",
        songUrl: " https://open.spotify.com/track/6wXPV6dNRAhFavrRaCdMXT?si=990666c03feb4eea"
      },
      {
        id: "12",
        title: "roomies",
        location: "Oakville, ON",
        image: "/polaroids/10xeng.png",
        songUrl: "https://open.spotify.com/track/1auxYwYrFRqZP7t3s7w4um?si=3cf2d5a2f7b74500"
      },
      {
        id: "13",
        title: "entropy ifykyk",
        location: "Oakville, ON",
        image: "/polaroids/entropy ifyyk.PNG",
        songUrl: "https://open.spotify.com/track/551xyaSJsg8hILXFq9JdST?si=b8651a2af5384226"
      },
      {
        id: "14",
        title: "senior sunrise",
        location: "Oakville, ON",
        image: "/polaroids/senior sunrise.PNG",
        songUrl: "https://open.spotify.com/track/0NUqi0ps17YpLUC3kgsZq0?si=027549695c894f41"
      },
      {
        id: "15",
        title: "end of the beginning - djo",
        location: "Chicago, IL",
        image: "/polaroids/end of the begining.png",
        songUrl: "https://open.spotify.com/track/3qhlB30KknSejmIvZZLjOD?si=2d6b0e552475446b"
      },
      {
        id: "16",
        title: "first hackathon i went to",
        location: "WeWork Toronto",
        image: "/polaroids/TheGang.png",
        songUrl: "https://open.spotify.com/track/6wXPV6dNRAhFavrRaCdMXT?si=990666c03feb4eea"
      },
      {
        id: "17",
        title: "spanish lattes in nyc",
        location: "New York City, NY",
        image: "/polaroids/spanish lattes in nyc.png",
        songUrl: "https://open.spotify.com/track/0TL0LFcwIBF5eX7arDIKxY?si=5dab4294e9d84b81"
      },
      {
        id: "18",
        title: "robotics exec social",
        location: "Oakville, ON",
        image: "/polaroids/execsocial.PNG",
        songUrl: "https://open.spotify.com/track/1Ukxccao1BlWrPhYkcXbwZ?si=9fee189e2ea547bb"
      }
      */
    ];

    // Film emulation photos
    const filmPhotos = [
      {
        id: "film1",
        location: "New York City, NY",
        image: "/emulation/littlepak.JPG"
      },
      {
        id: "film2",
        location: "New York City, NY",
        image: "/emulation/mainbridge.JPG"
      },
      {
        id: "film3",
        location: "New York City, NY",
        image: "/emulation/brownbuilding.JPG"
      },
      {
        id: "film4",
        location: "New York City, NY",
        image: "/emulation/pipe.JPG"
      },
      {
        id: "film5",
        location: "New York City, NY",
        image: "/emulation/sidebridge.JPG"
      },
      {
        id: "film6",
        location: "New York City, NY",
        image: "/emulation/atm.JPG"
      }
    ];

    // Disposable photos
    const disposablePhotos = [
      {
        id: "disp1",
        location: "Toronto, ON",
        image: "/disposable/IMG_3442.JPG"
      },
      {
        id: "disp2",
        location: "Toronto, ON",
        image: "/disposable/IMG_3445.JPG"
      },
      {
        id: "disp3",
        location: "Oakville, ON",
        image: "/disposable/IMG_3446.JPG"
      },
      {
        id: "disp4",
        location: "Toronto, ON",
        image: "/disposable/IMG_3448.JPG"
      },
      {
        id: "disp5",
        location: "Oakville, ON",
        image: "/disposable/IMG_3449.JPG"
      },
      {
        id: "disp6",
        location: "Toronto, ON",
        image: "/disposable/IMG_3450.JPG"
      },
      {
        id: "disp7",
        location: "Toronto, ON",
        image: "/disposable/IMG_3447.JPG"
      },
      {
        id: "disp8",
        location: "Oakville, ON",
        image: "/disposable/000138910025.jpg"
      },
      {
        id: "disp9",
        location: "Toronto, ON",
        image: "/disposable/000114970025.jpg"
      },
      {
        id: "disp10",
        location: "Oakville, ON",
        image: "/disposable/000114970006.jpg"
      },
      {
        id: "disp11",
        location: "Toronto, ON",
        image: "/disposable/000114970001.jpg"
      },
      {
        id: "disp12",
        location: "Oakville, ON",
        image: "/disposable/000114970005.jpg"
      },
      {
        id: "disp13",
        location: "Toronto, ON",
        image: "/disposable/000129720005.jpg"
      },
      {
        id: "disp14",
        location: "Oakville, ON",
        image: "/disposable/000129720006.jpg"
      },
      {
        id: "disp15",
        location: "Toronto, ON",
        image: "/disposable/000138910005.jpg"
      },
      {
        id: "disp16",
        location: "Oakville, ON",
        image: "/disposable/IMG_3418.JPG"
      },
      {
        id: "disp17",
        location: "Toronto, ON",
        image: "/disposable/IMG_3424.JPG"
      },
      {
        id: "disp18",
        location: "Oakville, ON",
        image: "/disposable/IMG_3440.JPG"
      },
      {
        id: "disp19",
        location: "Toronto, ON",
        image: "/disposable/IMG_3439.JPG"
      },
      {
        id: "disp20",
        location: "Oakville, ON",
        image: "/disposable/IMG_3461.JPG"
      },
      {
        id: "disp21",
        location: "Toronto, ON",
        image: "/disposable/IMG_3459.JPG"
      },
      {
        id: "disp22",
        location: "Oakville, ON",
        image: "/disposable/IMG_3453.JPG"
      },
      {
        id: "disp23",
        location: "Toronto, ON",
        image: "/disposable/IMG_3455.JPG"
      },
      {
        id: "disp24",
        location: "Oakville, ON",
        image: "/disposable/IMG_3435.JPG"
      },
      {
        id: "disp25",
        location: "Toronto, ON",
        image: "/disposable/IMG_3433.JPG"
      }
    ];

    // Get photos based on active tab
    const getDisplayPhotos = () => {
      switch(activePhotoTab) {
        case 'polaroids':
          return polaroidPhotos;
        case 'digital':
          return disposablePhotos;
        case 'film':
          return filmPhotos;
        default:
          return polaroidPhotos;
      }
    };

    const displayPhotos = getDisplayPhotos();

    const artworks = [
      { title: "Monks in a monastery courtyard", maker: "Franz Ludwig Catel", image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-2e29Do9yHyFR5htg2wh1BatKt8BdDE.png" },
      { title: "Grazing in the upper valley", maker: "Tommaso Cascella", image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-1MrUdq13746fjevelJSiCHGdPPWcQw.png" },
      { title: "The Fleeting Hour", maker: "Jim Buckels", image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-H9PdXCRY8vRVNqpgdPs1KulKV9rm9s.png" },
      { title: "Architect's Afternoon", maker: "Iwo Zaniewski", image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-ZW4L1fssw6yQozIRc5rdNeYcGHnGqU.png" },
      { title: "Two on a Bridge", maker: "Igor Shcherbakov", image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-fLW9jE5c4GwVCghT0XniyUDyJcbmWO.png" },
      { title: "Paris of the Future — Moebius 2000", maker: "Jean Giraud (Moebius)", image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-fUmc5kVWXYqbAl2K1zeCPJEdDvPyWT.png" },
      { title: "Lake of Tears", maker: "Ilya Glazunov", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Ilya_Glazunov._Lake_of_tears.jpg/1200px-Ilya_Glazunov._Lake_of_tears.jpg" },
      { title: "October", maker: "Très Riches Heures, Limbourg Brothers", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Les_Tr%C3%A8s_Riches_Heures_du_Duc_de_Berry_octobre.jpg/1200px-Les_Tr%C3%A8s_Riches_Heures_du_Duc_de_Berry_octobre.jpg" },
      { title: "View of Delft", maker: "Johannes Vermeer, 1661", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Vermeer-view-of-delft.jpg/1200px-Vermeer-view-of-delft.jpg" },
    ]

    return (
      <div className="pt-2" id="section-photos">
        <h2 className="text-4xl font-bold mb-4">photos</h2>
        <p className="text-lg text-muted-foreground mb-10">images I keep returning to.</p>
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          {artworks.map((artwork) => (
            <figure key={artwork.title} className="group">
              <div className="overflow-hidden bg-muted/20">
                <img
                  src={artwork.image}
                  alt={`${artwork.title} by ${artwork.maker}`}
                  loading="lazy"
                  className="aspect-[4/3] h-full w-full object-cover grayscale transition duration-500 group-hover:grayscale-0"
                />
              </div>
              <figcaption className="mt-3 flex items-baseline justify-between gap-4 border-b border-foreground/10 pb-3">
                <span className="font-newsreader text-base italic text-foreground">{artwork.title}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{artwork.maker}</span>
              </figcaption>
            </figure>
          ))}
        </div>
        <FavoritePhotosCarousel artworks={artworks} />
      </div>
    )
  }
}

