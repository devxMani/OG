import { NextResponse } from "next/server"

const ACTIVE_WINDOW_MS = 2 * 60 * 1000

type Visitor = {
  id: string
  latitude: number
  longitude: number
  location: string
  lastSeen: number
}

type VisitorStore = Map<string, Visitor>

const globalStore = globalThis as typeof globalThis & { visitorStore?: VisitorStore }
const visitors = globalStore.visitorStore ?? new Map<string, Visitor>()
globalStore.visitorStore = visitors

const timezoneLocations: Record<string, { latitude: number; longitude: number; location: string }> = {
  "America/Los_Angeles": { latitude: 37.8, longitude: -122.4, location: "San Francisco, US" },
  "America/Denver": { latitude: 39.7, longitude: -104.9, location: "Denver, US" },
  "America/Chicago": { latitude: 41.9, longitude: -87.6, location: "Chicago, US" },
  "America/New_York": { latitude: 40.7, longitude: -74, location: "New York, US" },
  "America/Toronto": { latitude: 43.7, longitude: -79.4, location: "Toronto, CA" },
  "America/Sao_Paulo": { latitude: -23.6, longitude: -46.6, location: "São Paulo, BR" },
  "Europe/London": { latitude: 51.5, longitude: -0.1, location: "London, GB" },
  "Europe/Paris": { latitude: 48.9, longitude: 2.4, location: "Paris, FR" },
  "Europe/Berlin": { latitude: 52.5, longitude: 13.4, location: "Berlin, DE" },
  "Europe/Amsterdam": { latitude: 52.4, longitude: 4.9, location: "Amsterdam, NL" },
  "Europe/Moscow": { latitude: 55.8, longitude: 37.6, location: "Moscow, RU" },
  "Africa/Cairo": { latitude: 30, longitude: 31.2, location: "Cairo, EG" },
  "Africa/Johannesburg": { latitude: -26.2, longitude: 28, location: "Johannesburg, ZA" },
  "Asia/Dubai": { latitude: 25.2, longitude: 55.3, location: "Dubai, AE" },
  "Asia/Kolkata": { latitude: 19.1, longitude: 72.9, location: "Mumbai, IN" },
  "Asia/Singapore": { latitude: 1.4, longitude: 103.8, location: "Singapore, SG" },
  "Asia/Bangkok": { latitude: 13.8, longitude: 100.5, location: "Bangkok, TH" },
  "Asia/Shanghai": { latitude: 31.2, longitude: 121.5, location: "Shanghai, CN" },
  "Asia/Tokyo": { latitude: 35.7, longitude: 139.7, location: "Tokyo, JP" },
  "Australia/Sydney": { latitude: -33.9, longitude: 151.2, location: "Sydney, AU" },
  "Pacific/Auckland": { latitude: -36.8, longitude: 174.8, location: "Auckland, NZ" },
}

function toCoordinate(value: string | null) {
  const coordinate = Number(value)
  return Number.isFinite(coordinate) ? Math.round(coordinate * 10) / 10 : null
}

function pruneVisitors(now: number) {
  for (const [id, visitor] of visitors) {
    if (visitor.lastSeen < now - ACTIVE_WINDOW_MS) visitors.delete(id)
  }
}

function response() {
  pruneVisitors(Date.now())

  return NextResponse.json(
    {
      count: visitors.size,
      visitors: [...visitors.values()].map(({ latitude, longitude, location }) => ({
        latitude,
        longitude,
        location: location ?? "Unknown location",
      })),
    },
    { headers: { "Cache-Control": "no-store" } },
  )
}

export async function GET() {
  return response()
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    visitorId?: unknown
    timeZone?: unknown
  } | null

  if (!body || typeof body.visitorId !== "string" || body.visitorId.length > 100) {
    return NextResponse.json({ error: "Invalid visitor" }, { status: 400 })
  }

  const latitude = toCoordinate(request.headers.get("x-vercel-ip-latitude"))
  const longitude = toCoordinate(request.headers.get("x-vercel-ip-longitude"))
  const timeZone = typeof body.timeZone === "string" ? body.timeZone : ""
  const fallback = timezoneLocations[timeZone]
  const city = request.headers.get("x-vercel-ip-city")?.replaceAll("%20", " ")
  const country = request.headers.get("x-vercel-ip-country")

  const hasGeolocation = latitude !== null && longitude !== null && (latitude !== 0 || longitude !== 0)

  if (hasGeolocation) {
    visitors.set(body.visitorId, {
      id: body.visitorId,
      latitude,
      longitude,
      location: city && country ? `${city}, ${country}` : country ?? "Unknown location",
      lastSeen: Date.now(),
    })
  } else if (fallback) {
    visitors.set(body.visitorId, {
      id: body.visitorId,
      latitude: fallback.latitude,
      longitude: fallback.longitude,
      location: fallback.location,
      lastSeen: Date.now(),
    })
  }

  return response()
}
