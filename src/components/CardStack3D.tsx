import { useRef, useState, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { TextureLoader } from 'three'
import * as THREE from 'three'
import './CardStack3D.css'

// Album covers - rock classics
const albums = [
  { id: 1, cover: '/albums/abbey-road.jpg', spineColor: '#2a2a2a' },
  { id: 2, cover: '/albums/paranoid.jpg', spineColor: '#1a1a1a' },
  { id: 3, cover: '/albums/ramones.jpg', spineColor: '#1a1a3a' },
  { id: 4, cover: '/albums/morning-glory.jpg', spineColor: '#3a2a1a' },
  { id: 5, cover: '/albums/offspring.jpg', spineColor: '#3a1a1a' },
  { id: 6, cover: '/albums/black-sabbath-due.jpg', spineColor: '#1a3a2a' },
]

interface VinylBoxProps {
  index: number
  scrollX: number
  cover: string
  spineColor: string
  totalCards: number
  isHovered: boolean
  onHover: (hover: boolean) => void
}

// Single Vinyl Box - proper 3D geometry
const VinylBox = ({ index, scrollX, cover, spineColor, totalCards, isHovered, onHover }: VinylBoxProps) => {
  const groupRef = useRef<THREE.Group>(null)
  const boxRef = useRef<THREE.Group>(null)
  const hoverProgress = useRef(0)

  const coverTexture = useLoader(TextureLoader, cover)

  // Box dimensions - realistic vinyl sleeve
  // A vinyl is ~31cm (12") square, spine ~3-5mm thick
  // Scale: 1.6 units = 31cm, so 5mm = ~0.026 units
  const W = 0.04  // Width (spine thickness) - realistic!
  const H = 1.6   // Height
  const D = 1.6   // Depth (cover size, square)

  useFrame(() => {
    if (!groupRef.current) return

    const cardSpacing = 0.35
    const baseX = index * cardSpacing
    const scrollOffset = scrollX * 0.04

    let x = baseX - scrollOffset
    const totalWidth = totalCards * cardSpacing

    // Infinite wrap - wrap only when FAR outside view
    const wrapThreshold = totalWidth * 0.8
    while (x < -wrapThreshold) x += totalWidth
    while (x > wrapThreshold) x -= totalWidth

    // Position boxes in a row
    groupRef.current.position.set(x * 4.5, 0, 0)

    // Hover animation - tilt to show more cover
    const targetHover = isHovered ? 1 : 0
    hoverProgress.current += (targetHover - hoverProgress.current) * 0.08

    if (boxRef.current) {
      // Base rotation + hover tilt
      boxRef.current.rotation.x = -0.65
      boxRef.current.rotation.y = -0.7 + hoverProgress.current * 0.35
    }

    // NO scaling or fading - boxes stay full size and visible
    groupRef.current.scale.setScalar(1)
  })

  return (
    <group
      ref={groupRef}
      onPointerOver={(e) => { e.stopPropagation(); onHover(true) }}
      onPointerOut={() => onHover(false)}
    >
      {/* Box container - all faces inside here rotate together */}
      <group ref={boxRef}>

        {/* ===== FRONT FACE (SPINE) ===== */}
        {/* Position: Z = +D/2 (front of the box) */}
        <mesh position={[0, 0, D / 2]}>
          <planeGeometry args={[W, H]} />
          <meshStandardMaterial
            color={spineColor}
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>

        {/* ===== RIGHT FACE (COVER with album art) ===== */}
        {/* Position: X = +W/2, rotated 90° to face right */}
        {/* This face connects to the right edge of the spine */}
        <mesh position={[W / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[D, H]} />
          <meshStandardMaterial
            map={coverTexture}
            roughness={0.2}
            metalness={0.05}
          />
        </mesh>

        {/* Cover glossy overlay */}
        <mesh position={[W / 2 + 0.002, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[D, H]} />
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={0.04}
          />
        </mesh>

        {/* ===== TOP FACE ===== */}
        {/* Position: Y = +H/2, rotated to face up */}
        <mesh position={[0, H / 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[W, D]} />
          <meshStandardMaterial
            color={spineColor}
            roughness={0.4}
          />
        </mesh>

        {/* Top edge highlight */}
        <mesh position={[0, H / 2 + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[W * 0.2, D]} />
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={0.12}
          />
        </mesh>

        {/* ===== BACK FACE ===== */}
        {/* Position: Z = -D/2, rotated 180° to face back */}
        <mesh position={[0, 0, -D / 2]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[W, H]} />
          <meshStandardMaterial
            color="#0a0a0a"
            roughness={0.9}
          />
        </mesh>

        {/* ===== LEFT FACE (back of cover) ===== */}
        {/* Position: X = -W/2, rotated -90° to face left */}
        <mesh position={[-W / 2, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[D, H]} />
          <meshStandardMaterial
            color="#111111"
            roughness={0.8}
          />
        </mesh>

        {/* ===== BOTTOM FACE ===== */}
        {/* Position: Y = -H/2, rotated to face down */}
        <mesh position={[0, -H / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[W, D]} />
          <meshStandardMaterial
            color={spineColor}
            roughness={0.5}
          />
        </mesh>

      </group>
    </group>
  )
}

// Scene
const ShelfScene = ({ scrollX, hoveredId, setHoveredId }: {
  scrollX: number
  hoveredId: number | null
  setHoveredId: (id: number | null) => void
}) => {
  const { camera } = useThree()

  useEffect(() => {
    camera.position.set(0, 1.5, 9)
    camera.lookAt(0, 0, 0)
  }, [camera])

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.9} />

      <spotLight
        position={[0, 10, 10]}
        angle={0.5}
        penumbra={1}
        intensity={1.5}
        castShadow
      />

      <directionalLight position={[10, 5, 5]} intensity={0.7} />
      <directionalLight position={[-10, 5, 5]} intensity={0.5} />

      <pointLight position={[-8, 2, 5]} intensity={0.4} color="#ff6b6b" />
      <pointLight position={[8, 2, 5]} intensity={0.4} color="#6b6bff" />

      {albums.map((album, index) => (
        <VinylBox
          key={album.id}
          index={index}
          scrollX={scrollX}
          cover={album.cover}
          spineColor={album.spineColor}
          totalCards={albums.length}
          isHovered={hoveredId === album.id}
          onHover={(hover) => setHoveredId(hover ? album.id : null)}
        />
      ))}
    </>
  )
}

// Main Component
const CardStack3D = () => {
  const [scrollX, setScrollX] = useState(0)
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const scrollRef = useRef(0)
  const targetRef = useRef(0)
  const velocityRef = useRef(0)
  const isDragging = useRef(false)
  const lastX = useRef(0)
  const lastTime = useRef(Date.now())

  // Smooth animation loop
  useEffect(() => {
    let animationId: number

    const animate = () => {
      const now = Date.now()
      const delta = Math.min((now - lastTime.current) / 16, 2)
      lastTime.current = now

      if (!isDragging.current) {
        velocityRef.current *= 0.92
        targetRef.current += velocityRef.current * delta

        if (Math.abs(velocityRef.current) < 0.00005) {
          velocityRef.current = 0
        }
      }

      const diff = targetRef.current - scrollRef.current
      scrollRef.current += diff * 0.05 * delta

      setScrollX(scrollRef.current)
      animationId = requestAnimationFrame(animate)
    }

    animate()
    return () => cancelAnimationFrame(animationId)
  }, [])

  // Mouse wheel
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = (e.deltaY || e.deltaX) * 0.0003
    velocityRef.current += delta
    targetRef.current += delta
  }

  // Drag handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true
    lastX.current = e.clientX
    velocityRef.current = 0
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return

    const deltaX = (lastX.current - e.clientX) * 0.0015
    targetRef.current += deltaX
    velocityRef.current = deltaX * 0.3
    lastX.current = e.clientX
  }

  const handlePointerUp = () => {
    isDragging.current = false
  }

  return (
    <div
      className="card-stack-container"
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <Canvas
        camera={{ fov: 50, position: [0, 1.5, 9] }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#0a0a0a']} />
        <Suspense fallback={null}>
          <ShelfScene
            scrollX={scrollX}
            hoveredId={hoveredId}
            setHoveredId={setHoveredId}
          />
        </Suspense>
      </Canvas>

      <div className="stack-gradient-left" />
      <div className="stack-gradient-right" />

      <div className="stack-scroll-hint">
        <span>Scroll or drag to browse</span>
      </div>
    </div>
  )
}

export default CardStack3D
