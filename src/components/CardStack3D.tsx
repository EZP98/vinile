import { useRef, useState, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { TextureLoader } from 'three'
import * as THREE from 'three'
import './CardStack3D.css'

// Album covers
const albums = [
  { id: 1, cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop', color: '#ff4d4d' },
  { id: 2, cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop', color: '#4d4dff' },
  { id: 3, cover: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop', color: '#ffd700' },
  { id: 4, cover: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&h=400&fit=crop', color: '#ff00ff' },
  { id: 5, cover: 'https://images.unsplash.com/photo-1504898770365-14faca6a7320?w=400&h=400&fit=crop', color: '#00bfff' },
  { id: 6, cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop', color: '#8b008b' },
  { id: 7, cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop', color: '#ff6b6b' },
  { id: 8, cover: 'https://images.unsplash.com/photo-1446057032654-9d8885db76c6?w=400&h=400&fit=crop', color: '#00ff88' },
  { id: 9, cover: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=400&h=400&fit=crop', color: '#ff8800' },
  { id: 10, cover: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=400&h=400&fit=crop', color: '#8844ff' },
]

interface CardProps {
  index: number
  scrollY: number
  cover: string
  totalCards: number
}

// Single Card in the stack
const StackCard = ({ index, scrollY, cover, totalCards }: CardProps) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const texture = useLoader(TextureLoader, cover)

  useFrame(() => {
    if (!meshRef.current) return

    // Calculate position based on scroll
    const cardSpacing = 0.4
    const baseY = index * cardSpacing

    // Scroll offset (continuous)
    const scrollOffset = scrollY * 0.5
    let y = baseY - scrollOffset

    // Wrap around for infinite scroll
    const totalHeight = totalCards * cardSpacing
    while (y < -2) y += totalHeight
    while (y > totalHeight - 2) y -= totalHeight

    // Z depth based on Y position (creates the pyramid)
    const z = -Math.abs(y) * 0.8 - 1

    // X spread based on Y (wider at bottom)
    const spreadFactor = Math.max(0, y + 1) * 0.15

    // Rotation tilt
    const rotX = 0.5 // tilt forward
    const rotZ = spreadFactor * 0.1

    meshRef.current.position.set(0, y, z)
    meshRef.current.rotation.set(rotX, 0, rotZ)

    // Scale based on depth
    const scale = THREE.MathUtils.mapLinear(z, -5, 0, 0.6, 1.2)
    meshRef.current.scale.setScalar(Math.max(0.3, scale))

    // Opacity based on position
    const material = meshRef.current.material as THREE.MeshStandardMaterial
    const opacity = THREE.MathUtils.clamp(1 - Math.abs(y) * 0.15, 0.2, 1)
    material.opacity = opacity
  })

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[1.6, 1.6]} />
      <meshStandardMaterial
        map={texture}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

// Scene
const StackScene = ({ scrollY }: { scrollY: number }) => {
  const { camera } = useThree()

  useEffect(() => {
    // Camera looking down at the stack
    camera.position.set(0, 3, 4)
    camera.lookAt(0, 0, -2)
  }, [camera])

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 10, 5]} intensity={1} />
      <pointLight position={[-5, 5, 5]} intensity={0.5} color="#ff4d4d" />
      <pointLight position={[5, 5, 5]} intensity={0.5} color="#4d4dff" />

      {albums.map((album, index) => (
        <StackCard
          key={album.id}
          index={index}
          scrollY={scrollY}
          cover={album.cover}
          totalCards={albums.length}
        />
      ))}
    </>
  )
}

// Main Component
const CardStack3D = () => {
  const [scrollY, setScrollY] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)
  const velocityRef = useRef(0)
  const targetScrollRef = useRef(0)
  const isDragging = useRef(false)
  const lastY = useRef(0)

  // Smooth animation loop
  useEffect(() => {
    const animate = () => {
      // Apply velocity with friction
      if (!isDragging.current) {
        velocityRef.current *= 0.95
        targetScrollRef.current += velocityRef.current
      }

      // Smooth interpolation
      setScrollY(prev => {
        const diff = targetScrollRef.current - prev
        return prev + diff * 0.1
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [])

  // Wheel handler
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    velocityRef.current += e.deltaY * 0.002
  }

  // Pointer handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true
    lastY.current = e.clientY
    velocityRef.current = 0
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return
    const deltaY = e.clientY - lastY.current
    targetScrollRef.current -= deltaY * 0.01
    velocityRef.current = -deltaY * 0.005
    lastY.current = e.clientY
  }

  const handlePointerUp = () => {
    isDragging.current = false
  }

  return (
    <div
      ref={containerRef}
      className="card-stack-container"
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <Canvas
        camera={{ fov: 50, position: [0, 3, 4] }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <StackScene scrollY={scrollY} />
        </Suspense>
      </Canvas>

      {/* Gradient overlays */}
      <div className="stack-gradient-top" />
      <div className="stack-gradient-bottom" />

      {/* Scroll hint */}
      <div className="stack-scroll-hint">
        <span>Scroll to explore</span>
        <div className="scroll-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </div>
    </div>
  )
}

export default CardStack3D
