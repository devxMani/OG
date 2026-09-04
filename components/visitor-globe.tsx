"use client"

import { Suspense, useEffect, useMemo, useRef, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Stars, Html, useTexture } from "@react-three/drei"
import * as THREE from "three"
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Globe2, MapPin, Pause, Play, RotateCcw, X, ZoomIn, ZoomOut } from "lucide-react"

type Visitor = {
  latitude: number
  longitude: number
  location: string
}

type VisitorResponse = {
  count: number
  visitors: Visitor[]
}

const GLOBE_RADIUS = 1.5

function latLonToVec3(lat: number, lon: number, radius = GLOBE_RADIUS) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  const x = -(radius * Math.sin(phi) * Math.cos(theta))
  const z = radius * Math.sin(phi) * Math.sin(theta)
  const y = radius * Math.cos(phi)
  return new THREE.Vector3(x, y, z)
}

const COUNTRIES: Array<Array<[number, number]>> = [
  [
    [-125, 49], [-125, 32], [-117, 32], [-111, 31], [-108, 31],
    [-106, 29], [-104, 29], [-103, 29], [-101, 29], [-99, 26],
    [-97, 26], [-97, 25], [-97, 28], [-94, 29], [-89, 29],
    [-88, 30], [-85, 30], [-83, 29], [-82, 25], [-81, 25],
    [-80, 25], [-80, 31], [-76, 33], [-75, 36], [-74, 39],
    [-75, 40], [-74, 41], [-71, 42], [-70, 44], [-67, 45],
    [-67, 47], [-68, 47], [-70, 47], [-75, 45], [-79, 43],
    [-82, 42], [-83, 45], [-85, 45], [-86, 46], [-88, 48],
    [-90, 48], [-94, 49], [-95, 49], [-100, 49], [-110, 49],
    [-115, 49], [-120, 49], [-124, 48], [-125, 48],
  ],
  [
    [-118, 60], [-110, 60], [-100, 60], [-90, 60], [-80, 60],
    [-70, 60], [-62, 60], [-56, 60], [-52, 60], [-48, 60],
    [-45, 60], [-42, 60], [-40, 63], [-43, 67], [-47, 70],
    [-52, 74], [-56, 78], [-60, 82], [-65, 83], [-75, 82],
    [-80, 79], [-85, 75], [-90, 72], [-95, 69], [-100, 66],
    [-105, 64], [-110, 62], [-115, 60],
  ],
  [
    [-82, 8], [-80, 9], [-77, 8], [-76, 9], [-74, 11],
    [-72, 12], [-71, 11], [-69, 12], [-67, 11], [-66, 10],
    [-65, 9], [-62, 8], [-60, 5], [-57, 2], [-54, -2],
    [-51, -5], [-49, -10], [-48, -15], [-48, -20], [-49, -25],
    [-52, -30], [-54, -34], [-57, -38], [-60, -42], [-64, -45],
    [-68, -48], [-71, -52], [-73, -55], [-72, -54], [-70, -53],
    [-68, -52], [-66, -50], [-65, -45], [-64, -40], [-64, -35],
    [-65, -30], [-67, -25], [-69, -20], [-70, -15], [-71, -10],
    [-73, -5], [-75, 0], [-77, 3], [-79, 6], [-81, 8],
  ],
  [
    [-9, 36], [-10, 43], [-5, 43], [0, 43], [2, 45],
    [5, 45], [8, 46], [10, 47], [12, 47], [15, 47],
    [18, 48], [22, 49], [25, 50], [28, 50], [30, 50],
    [32, 48], [33, 46], [33, 42], [30, 38], [27, 34],
    [25, 32], [22, 30], [18, 29], [15, 28], [12, 28],
    [8, 29], [5, 30], [2, 32], [0, 34], [-2, 35], [-5, 36],
  ],
  [
    [-10, 36], [-10, 30], [-5, 25], [0, 20], [5, 15],
    [8, 12], [10, 8], [11, 5], [10, 3], [9, 0],
    [8, -3], [8, -8], [9, -12], [11, -15], [13, -18],
    [16, -22], [20, -28], [23, -32], [26, -35], [29, -33],
    [32, -28], [34, -23], [36, -18], [38, -13], [40, -8],
    [42, -3], [45, 2], [48, 6], [51, 10], [49, 12],
    [46, 12], [43, 12], [40, 14], [37, 16], [35, 18],
    [33, 22], [32, 24], [31, 27], [28, 30], [25, 31],
    [22, 32], [18, 32], [15, 32], [12, 33], [8, 34],
    [5, 35], [2, 36], [-1, 36], [-5, 36],
  ],
  [
    [34, 42], [37, 42], [40, 42], [45, 45], [50, 48],
    [55, 50], [60, 50], [65, 48], [68, 46], [70, 42],
    [72, 38], [74, 34], [75, 30], [76, 25], [77, 22],
    [78, 20], [79, 15], [77, 12], [76, 8], [76, 5],
    [75, 3], [74, 2], [72, 4], [70, 8], [68, 12],
    [67, 16], [66, 19], [64, 20], [61, 21], [58, 22],
    [55, 22], [52, 21], [49, 18], [47, 15], [45, 12],
    [43, 10], [41, 8], [39, 6], [38, 4], [37, 3],
    [35, 4], [34, 6], [33, 8], [33, 12], [34, 16],
    [34, 20], [35, 24], [35, 28], [35, 32], [35, 36],
    [35, 40], [34, 42],
  ],
  [
    [68, 46], [75, 46], [80, 46], [88, 46], [95, 48],
    [100, 50], [105, 52], [110, 54], [118, 56], [125, 56],
    [130, 56], [135, 55], [140, 52], [141, 48], [143, 45],
    [145, 43], [146, 40], [145, 38], [141, 37], [137, 36],
    [130, 34], [125, 33], [122, 31], [121, 28], [119, 25],
    [115, 22], [112, 20], [110, 18], [108, 16], [107, 13],
    [105, 11], [103, 9], [101, 6], [99, 4], [97, 4],
    [95, 6], [93, 7], [91, 8], [89, 12], [88, 15],
    [87, 18], [86, 20], [84, 22], [81, 22], [79, 21],
    [77, 19], [75, 17], [73, 15], [71, 13], [70, 12],
    [68, 14], [67, 18], [67, 22], [67, 26], [67, 30],
    [68, 34], [68, 38], [68, 42], [68, 46],
  ],
  [
    [112, -10], [115, -15], [117, -20], [120, -25], [124, -30],
    [129, -33], [135, -35], [140, -37], [145, -39], [148, -38],
    [149, -34], [150, -30], [151, -26], [152, -22], [153, -18],
    [153, -14], [153, -10], [152, -6], [150, -2], [147, 0],
    [144, 1], [140, 1], [136, 0], [132, -2], [128, -4],
    [124, -6], [120, -8], [116, -10],
  ],
  [
    [128, 30], [132, 30], [137, 31], [141, 34], [145, 36],
    [146, 38], [145, 40], [141, 41], [137, 39], [134, 36],
    [131, 33], [128, 30],
  ],
  [
    [-55, 60], [-45, 62], [-30, 62], [-15, 63], [-10, 65],
    [-10, 68], [-15, 70], [-25, 73], [-35, 75], [-45, 77],
    [-55, 78], [-60, 75], [-58, 68], [-55, 60],
  ],
  [
    [-9, 58], [-10, 54], [-12, 51], [-10, 48], [-5, 49],
    [0, 48], [2, 48], [4, 47], [6, 46], [8, 47],
    [10, 49], [12, 51], [12, 54], [11, 58], [8, 59],
    [4, 59], [0, 59], [-4, 59], [-9, 58],
  ],
  [
    [-5, 34], [-5, 37], [-3, 37], [-2, 37], [-1, 36],
    [0, 36], [1, 36], [1, 35], [1, 34], [0, 34],
    [-2, 34], [-5, 34],
  ],
  [
    [23, 35], [24, 36], [25, 38], [26, 40], [28, 41],
    [29, 42], [29, 41], [28, 40], [27, 38], [26, 37],
    [25, 36], [23, 35],
  ],
  [
    [50, 25], [52, 26], [54, 27], [56, 28], [56, 26],
    [55, 25], [54, 24], [52, 24], [50, 25],
  ],
  [
    [51, 40], [53, 42], [56, 44], [59, 46], [62, 48],
    [65, 50], [67, 52], [69, 55], [73, 58], [75, 56],
    [76, 53], [76, 50], [74, 47], [70, 45], [66, 42],
    [62, 40], [59, 38], [56, 37], [53, 38], [51, 40],
  ],
  [
    [-170, -80], [-170, -85], [-150, -88], [-120, -89], [-90, -89],
    [-60, -89], [-30, -89], [0, -89], [30, -89], [60, -89],
    [90, -89], [120, -89], [150, -89], [170, -86], [175, -80],
    [170, -78], [150, -75], [120, -72], [90, -70], [60, -70],
    [30, -72], [0, -75], [-30, -76], [-60, -76], [-90, -74],
    [-120, -73], [-150, -75], [-170, -80],
  ],
]

function Landmasses() {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const { instances } = useMemo(() => {
    const points: Array<{ lat: number; lon: number }> = []
    for (const polygon of COUNTRIES) {
      if (polygon.length < 3) continue
      const lats = polygon.map((p) => p[1])
      const lons = polygon.map((p) => p[0])
      const minLat = Math.min(...lats)
      const maxLat = Math.max(...lats)
      const minLon = Math.min(...lons)
      const maxLon = Math.max(...lons)

      const step = 1.2
      for (let lat = minLat; lat <= maxLat; lat += step) {
        for (let lon = minLon; lon <= maxLon; lon += step) {
          let inside = false
          for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i][0], yi = polygon[i][1]
            const xj = polygon[j][0], yj = polygon[j][1]
            const intersect =
              yi > lat !== yj > lat &&
              lon < ((xj - xi) * (lat - yi)) / (yj - yi + 1e-9) + xi
            if (intersect) inside = !inside
          }
          if (inside) {
            const jitter = 0.3
            points.push({
              lat: lat + (Math.sin(lon * 3.1 + lat) * jitter),
              lon: lon + (Math.cos(lat * 2.7 + lon) * jitter),
            })
          }
        }
      }
    }
    return { instances: points }
  }, [])

  useFrame((_, delta) => {
    if (!meshRef.current) return
    for (let i = 0; i < instances.length; i++) {
      const { lat, lon } = instances[i]
      const pos = latLonToVec3(lat, lon, GLOBE_RADIUS + 0.006)
      dummy.position.copy(pos)
      const normal = pos.clone().normalize()
      dummy.lookAt(pos.clone().add(normal))
      dummy.scale.setScalar(0.013)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, instances.length]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 0.02]} />
      <meshStandardMaterial
        color="#b9b09a"
        roughness={0.7}
        metalness={0.05}
        transparent
        opacity={0.82}
      />
    </instancedMesh>
  )
}

function Graticule() {
  const ref = useRef<THREE.LineSegments>(null)
  const geometry = useMemo(() => {
    const points: number[] = []
    const push = (v: THREE.Vector3) => points.push(v.x, v.y, v.z)
    for (let lat = -80; lat <= 80; lat += 20) {
      for (let lon = -180; lon < 180; lon += 4) {
        push(latLonToVec3(lat, lon, GLOBE_RADIUS + 0.002))
        push(latLonToVec3(lat, lon + 4, GLOBE_RADIUS + 0.002))
      }
    }
    for (let lon = -180; lon < 180; lon += 30) {
      for (let lat = -80; lat < 80; lat += 4) {
        push(latLonToVec3(lat, lon, GLOBE_RADIUS + 0.002))
        push(latLonToVec3(lat + 4, lon, GLOBE_RADIUS + 0.002))
      }
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute("position", new THREE.Float32BufferAttribute(points, 3))
    return g
  }, [])
  return (
    <lineSegments ref={ref} geometry={geometry}>
      <lineBasicMaterial color="#6b5a44" transparent opacity={0.13} />
    </lineSegments>
  )
}

function Atmosphere() {
  const back = useRef<THREE.Mesh>(null)
  useFrame(({ camera }) => {
    if (back.current) back.current.lookAt(camera.position)
  })
  return (
    <>
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS + 0.18, 64, 64]} />
        <meshBasicMaterial
          color="#5aa9ff"
          transparent
          opacity={0.06}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={back}>
        <ringGeometry args={[GLOBE_RADIUS + 0.21, GLOBE_RADIUS + 0.34, 96]} />
        <meshBasicMaterial color="#a9c8ff" transparent opacity={0.09} side={THREE.DoubleSide} />
      </mesh>
    </>
  )
}

function GlobeBody() {
  return (
    <mesh>
      <sphereGeometry args={[GLOBE_RADIUS, 96, 96]} />
      <meshStandardMaterial
        color="#0f1419"
        roughness={0.9}
        metalness={0.1}
      />
    </mesh>
  )
}

type MarkerProps = {
  latitude: number
  longitude: number
  label: string
  count: number
}

function Marker({ latitude, longitude, label, count }: MarkerProps) {
  const groupRef = useRef<THREE.Group>(null)
  const [hover, setHover] = useState(false)
  const pos = useMemo(() => latLonToVec3(latitude, longitude, GLOBE_RADIUS), [latitude, longitude])
  const normal = useMemo(() => pos.clone().normalize(), [pos])

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime
    groupRef.current.position.copy(pos.clone().add(normal.clone().multiplyScalar(0.05 + Math.sin(t * 2 + latitude) * 0.01)))
    groupRef.current.lookAt(pos.clone().add(normal))
  })

  return (
    <group
      ref={groupRef}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      <mesh>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshBasicMaterial color="#34d399" />
      </mesh>
      <mesh position={[0, 0, -0.001]}>
        <ringGeometry args={[0.055, 0.075, 32]} />
        <meshBasicMaterial color="#34d399" transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, -0.002]}>
        <ringGeometry args={[0.09, 0.098, 32]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
      {(hover || count >= 2) && (
        <Html
          center
          distanceFactor={3}
          position={[0, 0.11, 0]}
          style={{ pointerEvents: "none" }}
        >
          <div className="whitespace-nowrap rounded-full border border-emerald-400/40 bg-black/80 px-3 py-1 text-[11px] font-medium text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.35)] backdrop-blur">
            <span className="mr-1 text-emerald-400">●</span>
            {label}
            <span className="ml-2 rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300">
              {count}
            </span>
          </div>
        </Html>
      )}
    </group>
  )
}

function Markers({ visitors }: { visitors: Visitor[] }) {
  const grouped = useMemo(() => {
    const map = new Map<string, { lat: number; lon: number; count: number; location: string }>()
    for (const v of visitors) {
      const key = `${v.location}`
      const existing = map.get(key)
      if (existing) {
        existing.lat = (existing.lat * existing.count + v.latitude) / (existing.count + 1)
        existing.lon = (existing.lon * existing.count + v.longitude) / (existing.count + 1)
        existing.count += 1
      } else {
        map.set(key, { lat: v.latitude, lon: v.longitude, count: 1, location: v.location })
      }
    }
    return [...map.values()]
  }, [visitors])

  return (
    <group>
      {grouped.map((m, i) => (
        <Marker
          key={i}
          latitude={m.lat}
          longitude={m.lon}
          label={m.location}
          count={m.count}
        />
      ))}
    </group>
  )
}

function Scene({ visitors, autoRotate, controlsRef }: {
  visitors: Visitor[]
  autoRotate: boolean
  controlsRef: React.MutableRefObject<any>
}) {
  const group = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    if (group.current && autoRotate) {
      group.current.rotation.y += delta * 0.18
    }
  })
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 3, 5]} intensity={1.2} color="#ffffff" />
      <directionalLight position={[-5, -2, -5]} intensity={0.25} color="#93c5fd" />
      <pointLight position={[0, 0, 0]} intensity={0.3} color="#4b5563" />
      <Stars
        radius={80}
        depth={50}
        count={2500}
        factor={4}
        saturation={0.2}
        fade
        speed={0.4}
      />
      <group ref={group}>
        <GlobeBody />
        <Graticule />
        <Landmasses />
        <Atmosphere />
        <Markers visitors={visitors} />
      </group>
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom
        minDistance={GLOBE_RADIUS + 0.3}
        maxDistance={GLOBE_RADIUS * 5}
        rotateSpeed={0.5}
        zoomSpeed={0.6}
        autoRotate={false}
        enableDamping
        dampingFactor={0.08}
      />
    </>
  )
}

function getVisitorId() {
  const key = "mani-visitor-id"
  const current = window.localStorage.getItem(key)
  if (current) return current
  const identifier = crypto.randomUUID()
  window.localStorage.setItem(key, identifier)
  return identifier
}

export function VisitorGlobe() {
  const [data, setData] = useState<VisitorResponse>({ count: 0, visitors: [] })
  const [isOpen, setIsOpen] = useState(false)
  const [autoRotate, setAutoRotate] = useState(true)
  const controlsRef = useRef<any>(null)

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
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([location, count]) => ({ location, count }))
  }, [data.visitors])

  const openGlobe = () => {
    setIsOpen(true)
  }

  const summary = data.count === 0
    ? "No active readers just yet."
    : data.count === 1
      ? `1 active reader · ${locations[0]?.location ?? "Unknown location"}`
      : `${data.count} active readers · ${locations.length} locations`

  const resetView = () => {
    if (!controlsRef.current) return
    controlsRef.current.reset()
  }

  const zoomIn = () => {
    if (!controlsRef.current) return
    controlsRef.current.dollyIn(1.4)
    controlsRef.current.update()
  }

  const zoomOut = () => {
    if (!controlsRef.current) return
    controlsRef.current.dollyOut(1.4)
    controlsRef.current.update()
  }

  const rotate = (deltaLon: number, deltaLat: number = 0) => {
    if (!controlsRef.current) return
    const c = controlsRef.current
    const spherical = new THREE.Spherical()
    spherical.setFromVector3(c.target.clone().sub(c.object.position))
    spherical.theta += deltaLon * (Math.PI / 180) * -1
    spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi + deltaLat * (Math.PI / 180)))
    const v = new THREE.Vector3().setFromSpherical(spherical).add(c.target)
    c.object.position.copy(v)
    c.update()
  }

  return (
    <>
      <button
        type="button"
        onClick={openGlobe}
        className="group flex h-7 items-center gap-2 rounded-md border border-transparent px-2 text-xs text-muted-foreground transition-all hover:border-border/60 hover:bg-muted/50 hover:text-foreground"
        aria-label="Open live visitor globe"
      >
        <span className="relative flex h-2 w-2 items-center justify-center">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
        </span>
        <Globe2 className="h-3.5 w-3.5 opacity-70 transition-opacity group-hover:opacity-100" />
        <span className="font-medium tabular-nums">{data.count}</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label="Live visitor globe"
          onClick={() => setIsOpen(false)}
        >
          <section
            className="relative flex w-full max-w-[640px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#161410]/95 to-[#0c0b09]/95 text-[#ece8dd] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] ring-1 ring-black/40"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 px-6 pb-2 pt-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2 items-center justify-center">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </span>
                  <h2 className="text-sm font-semibold tracking-wide text-[#ece8dd]">Live Visitors</h2>
                </div>
                <p className="mt-1 text-[11px] leading-5 text-[#a59d87]">{summary}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-[#aaa79e] transition-colors hover:border-white/30 hover:bg-white/5 hover:text-white"
                aria-label="Close globe"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mx-4 mt-1 overflow-hidden rounded-2xl border border-white/5 bg-black/40">
              <div className="relative h-[420px] w-full">
                <Canvas
                  camera={{ position: [0, 0.5, 4.5], fov: 38 }}
                  gl={{ antialias: true, alpha: true }}
                  dpr={[1, 2]}
                >
                  <Suspense fallback={null}>
                    <Scene visitors={data.visitors} autoRotate={autoRotate} controlsRef={controlsRef} />
                  </Suspense>
                </Canvas>

                <div className="pointer-events-none absolute bottom-3 left-3 flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/50 px-2.5 py-1 text-[10px] text-[#b9b09a] backdrop-blur">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Active: {data.count}
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/50 px-2.5 py-1 text-[10px] text-[#b9b09a] backdrop-blur">
                    <MapPin className="h-2.5 w-2.5" />
                    Locations: {locations.length}
                  </div>
                </div>

                <div className="pointer-events-none absolute bottom-3 right-3 rounded-full border border-white/10 bg-black/50 px-2.5 py-1 text-[10px] text-[#b9b09a] backdrop-blur">
                  drag to rotate · scroll to zoom
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 px-5 pb-5 pt-4">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => rotate(-20, 0)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-[#b9b09a] transition-all hover:border-white/25 hover:bg-white/5 hover:text-white"
                  aria-label="Rotate globe left"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                </button>
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => rotate(0, -18)}
                    className="flex h-4 w-9 items-start justify-center rounded-lg border border-white/10 pt-0.5 text-[#b9b09a] transition-all hover:border-white/25 hover:bg-white/5 hover:text-white"
                    aria-label="Tilt globe up"
                  >
                    <ArrowUp className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => rotate(0, 18)}
                    className="flex h-4 w-9 items-end justify-center rounded-lg border border-white/10 pb-0.5 text-[#b9b09a] transition-all hover:border-white/25 hover:bg-white/5 hover:text-white"
                    aria-label="Tilt globe down"
                  >
                    <ArrowDown className="h-3 w-3" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => rotate(20, 0)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-[#b9b09a] transition-all hover:border-white/25 hover:bg-white/5 hover:text-white"
                  aria-label="Rotate globe right"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setAutoRotate((v) => !v)}
                  className={`flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs transition-all ${
                    autoRotate
                      ? "border-[#d8b98a]/40 bg-[#d8b98a]/10 text-[#d8b98a]"
                      : "border-white/10 text-[#b9b09a] hover:border-white/25 hover:bg-white/5 hover:text-white"
                  }`}
                  aria-label="Toggle auto-rotate"
                >
                  {autoRotate ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  {autoRotate ? "Spinning" : "Paused"}
                </button>
                <button
                  type="button"
                  onClick={zoomOut}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-[#b9b09a] transition-all hover:border-white/25 hover:bg-white/5 hover:text-white"
                  aria-label="Zoom out"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={zoomIn}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-[#b9b09a] transition-all hover:border-white/25 hover:bg-white/5 hover:text-white"
                  aria-label="Zoom in"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={resetView}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-[#b9b09a] transition-all hover:border-white/25 hover:bg-white/5 hover:text-white"
                  aria-label="Reset globe view"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {locations.length > 0 && (
              <div className="max-h-[140px] overflow-y-auto border-t border-white/5 bg-black/20 px-5 pb-4 pt-3">
                <div className="mb-2 flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-[#a59d87]" />
                  <span className="text-[11px] font-medium uppercase tracking-wider text-[#a59d87]">Top Locations</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {locations.slice(0, 6).map(({ location, count }) => (
                    <div
                      key={location}
                      className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-2.5 py-1.5 text-[11px]"
                    >
                      <span className="truncate text-[#d8cfc0]">{location}</span>
                      <span className="ml-2 shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 font-semibold text-emerald-400">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </>
  )
}
