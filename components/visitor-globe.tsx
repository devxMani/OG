"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, RotateCcw, X } from "lucide-react"

type Visitor = {
  latitude: number
  longitude: number
  location: string
}

type VisitorResponse = {
  count: number
  visitors: Visitor[]
}

type GlobePoint = {
  latitude: number
  longitude: number
}

const LANDMASSES = [
  [[-168, 72], [-140, 74], [-125, 68], [-123, 54], [-115, 35], [-100, 18], [-82, 9], [-76, 21], [-82, 31], [-70, 44], [-57, 52], [-60, 62], [-84, 70], [-120, 72]],
  [[-81, 12], [-67, 10], [-52, -2], [-45, -23], [-53, -55], [-67, -55], [-76, -35]],
  [[-11, 71], [24, 74], [67, 77], [111, 72], [150, 62], [158, 54], [144, 46], [127, 41], [120, 23], [108, 8], [100, 15], [93, 23], [79, 8], [68, 25], [54, 24], [43, 31], [31, 35], [18, 42], [5, 36], [-7, 44]],
  [[-18, 36], [10, 37], [31, 31], [42, 12], [39, -18], [27, -35], [12, -35], [-1, -18], [-12, 7]],
  [[112, -11], [155, -10], [153, -38], [139, -45], [115, -35]],
  [[130, 33], [143, 45], [146, 32], [137, 30]],
  [[-53, 60], [-20, 64], [-23, 78], [-48, 83], [-65, 75]],
]

const GLOBE_RADIUS = 142
const GLOBE_CENTER = 170

function getVisitorId() {
  const key = "mani-visitor-id"
  const current = window.localStorage.getItem(key)
  if (current) return current

  const identifier = crypto.randomUUID()
  window.localStorage.setItem(key, identifier)
  return identifier
}

function isInsidePolygon(longitude: number, latitude: number, polygon: number[][]) {
  let inside = false
  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index++) {
    const [currentLongitude, currentLatitude] = polygon[index]
    const [previousLongitude, previousLatitude] = polygon[previous]
    const intersects = (currentLatitude > latitude) !== (previousLatitude > latitude)
      && longitude < ((previousLongitude - currentLongitude) * (latitude - currentLatitude)) / (previousLatitude - currentLatitude) + currentLongitude
    if (intersects) inside = !inside
  }
  return inside
}

function createGlobePoints() {
  const points: GlobePoint[] = []
  for (let latitude = -56; latitude <= 78; latitude += 1.9) {
    for (let longitude = -180; longitude < 180; longitude += 1.9) {
      if (LANDMASSES.some((landmass) => isInsidePolygon(longitude, latitude, landmass))) {
        points.push({
          latitude: latitude + Math.sin(longitude * 4.13 + latitude) * 0.34,
          longitude: longitude + Math.cos(latitude * 3.71 + longitude) * 0.34,
        })
      }
    }
  }
  return points
}

const globePoints = createGlobePoints()

function projectPoint(latitude: number, longitude: number, rotation: number, tilt: number) {
  const latitudeRadians = (latitude * Math.PI) / 180
  const longitudeRadians = ((longitude + rotation) * Math.PI) / 180
  const tiltRadians = (tilt * Math.PI) / 180
  const x = Math.cos(latitudeRadians) * Math.sin(longitudeRadians)
  const y = Math.sin(latitudeRadians)
  const z = Math.cos(latitudeRadians) * Math.cos(longitudeRadians)
  const tiltedY = y * Math.cos(tiltRadians) - z * Math.sin(tiltRadians)
  const depth = y * Math.sin(tiltRadians) + z * Math.cos(tiltRadians)

  return {
    x: GLOBE_CENTER + x * GLOBE_RADIUS,
    y: GLOBE_CENTER - tiltedY * GLOBE_RADIUS,
    depth,
  }
}

function drawRoundedLabel(context: CanvasRenderingContext2D, label: string, x: number, y: number) {
  context.font = "12px ui-monospace, SFMono-Regular, Menlo, monospace"
  const width = context.measureText(label).width + 22
  const labelX = Math.min(Math.max(x - width / 2, 10), 340 - width - 10)
  const labelY = Math.max(y - 38, 12)

  context.fillStyle = "#efede8"
  context.beginPath()
  context.roundRect(labelX, labelY, width, 24, 12)
  context.fill()
  context.fillStyle = "#24211d"
  context.fillText(label, labelX + 11, labelY + 16)
}

export function VisitorGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [data, setData] = useState<VisitorResponse>({ count: 0, visitors: [] })
  const [isOpen, setIsOpen] = useState(false)
  const [rotation, setRotation] = useState(15)
  const [tilt, setTilt] = useState(-8)

  useEffect(() => {
    const visitorId = getVisitorId()
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    let mounted = true

    const update = async (method: "GET" | "POST") => {
      const options = method === "POST"
        ? { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ visitorId, timeZone }) }
        : { method }
      const response = await fetch("/api/visitors", options)
      if (!response.ok || !mounted) return
      setData(await response.json())
    }

    void update("POST").catch(() => {})
    const presence = window.setInterval(() => void update("POST").catch(() => {}), 60_000)
    const refresh = window.setInterval(() => void update("GET").catch(() => {}), 15_000)

    return () => {
      mounted = false
      window.clearInterval(presence)
      window.clearInterval(refresh)
    }
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const interval = window.setInterval(() => setRotation((current) => (current + 0.35) % 360), 80)
    return () => window.clearInterval(interval)
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const locations = useMemo(() => {
    const counts = new Map<string, number>()
    for (const visitor of data.visitors) {
      counts.set(visitor.location, (counts.get(visitor.location) ?? 0) + 1)
    }
    return [...counts.entries()].map(([location, count]) => ({ location, count }))
  }, [data.visitors])

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return
    const canvas = canvasRef.current
    const size = 340
    const ratio = window.devicePixelRatio || 1
    canvas.width = size * ratio
    canvas.height = size * ratio
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`

    const context = canvas.getContext("2d")
    if (!context) return
    context.scale(ratio, ratio)
    context.clearRect(0, 0, size, size)

    const glow = context.createRadialGradient(GLOBE_CENTER, GLOBE_CENTER, 90, GLOBE_CENTER, GLOBE_CENTER, 172)
    glow.addColorStop(0, "rgba(0, 0, 0, 0.02)")
    glow.addColorStop(0.75, "rgba(0, 0, 0, 0.34)")
    glow.addColorStop(1, "rgba(0, 0, 0, 0)")
    context.fillStyle = glow
    context.fillRect(0, 0, size, size)

    for (const point of globePoints) {
      const projected = projectPoint(point.latitude, point.longitude, rotation, tilt)
      if (projected.depth <= 0) continue
      context.fillStyle = `rgba(236, 232, 220, ${0.22 + projected.depth * 0.62})`
      context.fillRect(projected.x, projected.y, 1.15, 1.15)
    }

    const visibleVisitors = data.visitors
      .map((visitor) => ({ visitor, projected: projectPoint(visitor.latitude, visitor.longitude, rotation, tilt) }))
      .filter(({ projected }) => projected.depth > 0)

    for (const { projected } of visibleVisitors) {
      context.fillStyle = "rgba(34, 197, 94, 0.2)"
      context.beginPath()
      context.arc(projected.x, projected.y, 9, 0, Math.PI * 2)
      context.fill()
      context.fillStyle = "#22c55e"
      context.beginPath()
      context.arc(projected.x, projected.y, 4.2, 0, Math.PI * 2)
      context.fill()
    }

    const labelledVisitor = visibleVisitors[0]
    if (labelledVisitor) {
      const count = locations.find((location) => location.location === labelledVisitor.visitor.location)?.count ?? 1
      drawRoundedLabel(context, `${labelledVisitor.visitor.location} · ${count}`, labelledVisitor.projected.x, labelledVisitor.projected.y)
    }
  }, [data.visitors, isOpen, locations, rotation, tilt])

  const summary = data.count === 1
    ? `1 active reader across ${locations[0]?.location ?? "the world"} (1).`
    : data.count > 1
      ? `${data.count} active readers across ${locations.length} locations.`
      : "No active readers just yet."

  const openGlobe = () => {
    const firstVisitor = data.visitors[0]
    if (firstVisitor) {
      setRotation(-firstVisitor.longitude)
      setTilt(0)
    }
    setIsOpen(true)
  }

  return (
    <>
      <button
        type="button"
        onClick={openGlobe}
        className="flex h-7 items-center gap-2 rounded-md px-2 text-xs text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
        aria-label="Open live visitor globe"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
        <span>{data.count}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Live visitor globe">
          <section className="relative w-full max-w-[440px] overflow-hidden rounded-2xl border border-white/10 bg-[#191817] px-6 pb-6 pt-5 text-[#ece8dd] shadow-2xl sm:px-8">
            <button type="button" onClick={() => setIsOpen(false)} className="absolute right-4 top-4 text-[#aaa79e] transition-colors hover:text-white" aria-label="Close globe">
              <X className="h-4 w-4" />
            </button>
            <p className="pr-8 font-mono text-xs leading-5 text-[#d8b98a]">{summary}</p>

            <div className="mx-auto mt-1 flex w-full justify-center">
              <canvas ref={canvasRef} className="max-w-full" aria-label="Rotating globe showing approximate visitor locations" role="img" />
            </div>

            <div className="flex justify-center gap-1.5">
              <button type="button" onClick={() => setRotation((current) => current - 16)} className="globe-control" aria-label="Rotate globe left"><ArrowLeft /></button>
              <button type="button" onClick={() => setTilt((current) => Math.min(current + 12, 48))} className="globe-control" aria-label="Tilt globe up"><ArrowUp /></button>
              <button type="button" onClick={() => { setRotation(15); setTilt(-8) }} className="globe-control" aria-label="Reset globe view"><RotateCcw /></button>
              <button type="button" onClick={() => setTilt((current) => Math.max(current - 12, -48))} className="globe-control" aria-label="Tilt globe down"><ArrowDown /></button>
              <button type="button" onClick={() => setRotation((current) => current + 16)} className="globe-control" aria-label="Rotate globe right"><ArrowRight /></button>
            </div>
          </section>
        </div>
      )}
    </>
  )
}
