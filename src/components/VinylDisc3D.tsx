import { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Effects } from '@react-three/drei'
import * as THREE from 'three'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { extend } from '@react-three/fiber'

extend({ UnrealBloomPass })

// Global scroll progress
let globalScrollProgress = 0

// Tracce dell'album
const tracks = [
  { name: 'Side A - Track 1', angle: 0, radius: 0.85 },
  { name: 'Side A - Track 2', angle: 45, radius: 0.75 },
  { name: 'Side A - Track 3', angle: 90, radius: 0.65 },
  { name: 'Side B - Track 1', angle: 180, radius: 0.85 },
  { name: 'Side B - Track 2', angle: 225, radius: 0.75 },
  { name: 'Side B - Track 3', angle: 270, radius: 0.65 },
]

// Converti angolo e raggio in posizione 3D
function polarToPosition(angle: number, radius: number, discRadius: number): [number, number, number] {
  const rad = (angle * Math.PI) / 180
  const x = Math.cos(rad) * radius * discRadius
  const z = Math.sin(rad) * radius * discRadius
  return [x, 0.02, z]
}

// Genera punti per i solchi del vinile (cerchi concentrici)
function generateGroovePoints(outerRadius: number, innerRadius: number): Float32Array {
  const points: number[] = []
  const rings = 60 // numero di cerchi
  const pointsPerRing = 180 // punti per cerchio

  for (let r = 0; r < rings; r++) {
    const radius = innerRadius + ((outerRadius - innerRadius) * r) / rings
    const angleStep = (Math.PI * 2) / pointsPerRing

    for (let i = 0; i < pointsPerRing; i++) {
      // Aggiungi un po' di variazione per effetto organico
      const variation = Math.random() * 0.003
      const angle = angleStep * i + Math.random() * 0.02
      const x = Math.cos(angle) * (radius + variation)
      const z = Math.sin(angle) * (radius + variation)
      points.push(x, 0, z)
    }
  }

  return new Float32Array(points)
}

// Genera punti per il bordo esterno
function generateEdgePoints(radius: number): Float32Array {
  const points: number[] = []
  const rings = 3
  const pointsPerRing = 200

  for (let r = 0; r < rings; r++) {
    const ringRadius = radius + r * 0.008
    const angleStep = (Math.PI * 2) / pointsPerRing

    for (let i = 0; i < pointsPerRing; i++) {
      const angle = angleStep * i
      const x = Math.cos(angle) * ringRadius
      const z = Math.sin(angle) * ringRadius
      points.push(x, 0, z)
    }
  }

  return new Float32Array(points)
}

// Genera punti per la label centrale
function generateLabelPoints(radius: number): Float32Array {
  const points: number[] = []
  const rings = 15
  const basePointsPerRing = 40

  for (let r = 1; r <= rings; r++) {
    const ringRadius = (radius * r) / rings
    const pointsPerRing = Math.floor(basePointsPerRing * (r / rings))
    const angleStep = (Math.PI * 2) / pointsPerRing

    for (let i = 0; i < pointsPerRing; i++) {
      const angle = angleStep * i
      const x = Math.cos(angle) * ringRadius
      const z = Math.sin(angle) * ringRadius
      points.push(x, 0.01, z)
    }
  }

  return new Float32Array(points)
}

// Pin per le tracce
interface TrackPinProps {
  position: [number, number, number]
  track: typeof tracks[0]
  isHovered: boolean
  onHover: (track: typeof tracks[0] | null, screenPos?: { x: number; y: number }) => void
}

const TrackPin = ({ position, track, isHovered, onHover }: TrackPinProps) => {
  const ring1Ref = useRef<THREE.Mesh>(null)
  const ring2Ref = useRef<THREE.Mesh>(null)
  const ring3Ref = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  const { camera, size } = useThree()

  useFrame(({ clock }) => {
    const t = clock.elapsedTime

    if (ring1Ref.current) {
      const scale1 = 1 + Math.sin(t * 0.8) * 0.15
      ring1Ref.current.scale.setScalar(isHovered ? 1.4 : scale1)
    }

    if (ring2Ref.current) {
      const scale2 = 1 + Math.sin(t * 0.8 + 0.5) * 0.1
      ring2Ref.current.scale.setScalar(isHovered ? 1.25 : scale2)
    }

    if (ring3Ref.current) {
      const scale3 = 1 + Math.sin(t * 0.8 + 1) * 0.08
      ring3Ref.current.scale.setScalar(isHovered ? 1.15 : scale3)
    }
  })

  const handlePointerOver = () => {
    if (groupRef.current) {
      const worldPos = new THREE.Vector3()
      groupRef.current.getWorldPosition(worldPos)
      const screenPos = worldPos.clone().project(camera)
      const x = (screenPos.x * 0.5 + 0.5) * size.width
      const y = (-screenPos.y * 0.5 + 0.5) * size.height
      onHover(track, { x, y })
    }
  }

  return (
    <group ref={groupRef} position={position}>
      {/* Ring 1 - Outermost glow */}
      <mesh ref={ring1Ref} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.025, 0.035, 32]} />
        <meshBasicMaterial
          color="#ff4444"
          transparent
          opacity={isHovered ? 0.4 : 0.15}
        />
      </mesh>

      {/* Ring 2 - Middle glow */}
      <mesh ref={ring2Ref} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.015, 0.022, 32]} />
        <meshBasicMaterial
          color="#ff6666"
          transparent
          opacity={isHovered ? 0.6 : 0.3}
        />
      </mesh>

      {/* Ring 3 - Inner core */}
      <mesh ref={ring3Ref} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.012, 32]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={isHovered ? 1 : 0.8}
        />
      </mesh>

      {/* Invisible hitbox */}
      <mesh
        onPointerOver={handlePointerOver}
        onPointerOut={() => onHover(null)}
      >
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  )
}

// Contenuto del disco
interface DiscContentProps {
  onTrackHover: (track: typeof tracks[0] | null, screenPos?: { x: number; y: number }) => void
  hoveredTrack: typeof tracks[0] | null
}

const DiscContent = ({ onTrackHover, hoveredTrack }: DiscContentProps) => {
  const discRef = useRef<THREE.Group>(null)
  const currentSpeed = useRef(0.15)
  const discRadius = 1.8
  const targetScale = useRef(1)
  const targetRotX = useRef(-0.3)
  const targetPosY = useRef(0)
  const targetPosZ = useRef(0)

  // Genera punti
  const groovePoints = useMemo(() => generateGroovePoints(discRadius * 0.95, discRadius * 0.25), [])
  const edgePoints = useMemo(() => generateEdgePoints(discRadius), [])
  const labelPoints = useMemo(() => generateLabelPoints(discRadius * 0.22), [])

  // Pin positions
  const pins = useMemo(() => {
    return tracks.map((track) => ({
      track,
      position: polarToPosition(track.angle, track.radius, discRadius),
    }))
  }, [])

  // Rotazione automatica + scroll animations
  useFrame((_, delta) => {
    if (discRef.current) {
      // Auto rotation - accelera con lo scroll
      const targetSpeed = hoveredTrack ? 0.03 : 0.2 + globalScrollProgress * 2
      currentSpeed.current += (targetSpeed - currentSpeed.current) * 0.02
      discRef.current.rotation.y += delta * currentSpeed.current

      // Scroll-based transformations - MOLTO più drammatiche
      const scroll = globalScrollProgress

      // Scale: parte piccolo (0.6), diventa ENORME (2.5)
      targetScale.current = 0.6 + scroll * 2

      // Rotation X: parte inclinato, diventa piatto e poi si ribalta
      targetRotX.current = -0.5 + scroll * 1.2

      // Position Y: parte in basso, sale molto
      targetPosY.current = -0.5 + scroll * 3

      // Position Z: parte lontano, viene verso la camera
      targetPosZ.current = -2 + scroll * 4

      // Smooth lerp to targets - più reattivo
      const lerpSpeed = 0.12
      discRef.current.scale.x += (targetScale.current - discRef.current.scale.x) * lerpSpeed
      discRef.current.scale.y += (targetScale.current - discRef.current.scale.y) * lerpSpeed
      discRef.current.scale.z += (targetScale.current - discRef.current.scale.z) * lerpSpeed

      discRef.current.rotation.x += (targetRotX.current - discRef.current.rotation.x) * lerpSpeed
      discRef.current.position.y += (targetPosY.current - discRef.current.position.y) * lerpSpeed
      discRef.current.position.z += (targetPosZ.current - discRef.current.position.z) * lerpSpeed
    }
  })

  return (
    <group ref={discRef} rotation={[-0.3, 0, 0]}>
      {/* Solchi del vinile */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[groovePoints, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.008}
          color="#ffffff"
          transparent
          opacity={0.5}
          sizeAttenuation
        />
      </points>

      {/* Bordo esterno */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[edgePoints, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.012}
          color="#ffffff"
          transparent
          opacity={0.8}
          sizeAttenuation
        />
      </points>

      {/* Label centrale */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[labelPoints, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.015}
          color="#ff4444"
          transparent
          opacity={0.9}
          sizeAttenuation
        />
      </points>

      {/* Centro del disco */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <circleGeometry args={[0.03, 32]} />
        <meshBasicMaterial color="#0a0a0a" />
      </mesh>

      {/* Pin delle tracce */}
      {pins.map((pin, i) => (
        <TrackPin
          key={i}
          position={pin.position}
          track={pin.track}
          isHovered={hoveredTrack?.name === pin.track.name}
          onHover={onTrackHover}
        />
      ))}
    </group>
  )
}

// Bloom effect
const BloomEffect = () => {
  const { size } = useThree()
  return (
    <Effects>
      {/* @ts-ignore */}
      <unrealBloomPass
        threshold={0.1}
        strength={0.25}
        radius={0.8}
        resolution={new THREE.Vector2(size.width, size.height)}
      />
    </Effects>
  )
}

// Main Component
const VinylDisc3D = () => {
  const [hoveredTrack, setHoveredTrack] = useState<typeof tracks[0] | null>(null)
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)

  const handleTrackHover = (track: typeof tracks[0] | null, screenPos?: { x: number; y: number }) => {
    setHoveredTrack(track)
    setTooltipPos(screenPos || null)
  }

  // Scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return
      const rect = sectionRef.current.getBoundingClientRect()
      const sectionHeight = rect.height
      const scrolled = -rect.top
      const progress = Math.max(0, Math.min(1, scrolled / (sectionHeight * 0.5)))
      globalScrollProgress = progress
      setScrollProgress(progress)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section
      ref={sectionRef}
      style={{
        width: '100%',
        height: '200vh',
        backgroundColor: '#000000',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Track tooltip */}
      {hoveredTrack && tooltipPos && (
        <div
          style={{
            position: 'absolute',
            left: tooltipPos.x + 20,
            top: tooltipPos.y - 30,
            padding: '10px 14px',
            borderRadius: '2px',
            background: 'rgba(10, 10, 10, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#ffffff',
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: '12px',
            lineHeight: 1.5,
            textAlign: 'left',
            zIndex: 10,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          <div style={{
            color: '#ff4444',
            marginBottom: '2px',
            fontSize: '9px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            fontWeight: 500
          }}>
            Now Playing
          </div>
          <div style={{ fontWeight: 500 }}>{hoveredTrack.name}</div>
        </div>
      )}

      {/* Title - fades out on scroll */}
      <div
        style={{
          position: 'fixed',
          bottom: '60px',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          zIndex: 10,
          pointerEvents: 'none',
          opacity: 1 - scrollProgress * 2,
          transition: 'opacity 0.1s ease',
        }}
      >
        <h2
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 'clamp(32px, 8vw, 72px)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: '#fff',
            margin: 0,
          }}
        >
          VINILE
        </h2>
        <p
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: '11px',
            letterSpacing: '0.2em',
            color: 'rgba(255, 255, 255, 0.4)',
            textTransform: 'uppercase',
            marginTop: '8px',
          }}
        >
          The sound of warmth
        </p>
      </div>

      {/* Scroll hint */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          zIndex: 10,
          opacity: 1 - scrollProgress * 3,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            width: '1px',
            height: '30px',
            background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.3))',
          }}
        />
        <span
          style={{
            fontSize: '9px',
            letterSpacing: '0.2em',
            color: 'rgba(255,255,255,0.3)',
            textTransform: 'uppercase',
          }}
        >
          Scroll
        </span>
      </div>

      {/* Canvas - fixed position */}
      <Canvas
        camera={{ position: [0, 2, 4], fov: 45 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          background: 'transparent',
        }}
        gl={{ antialias: true, alpha: true }}
      >
        <DiscContent
          onTrackHover={handleTrackHover}
          hoveredTrack={hoveredTrack}
        />
        <BloomEffect />
      </Canvas>
    </section>
  )
}

export default VinylDisc3D
