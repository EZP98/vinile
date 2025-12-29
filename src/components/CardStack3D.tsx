import { useRef, useState, useEffect, Suspense, useMemo } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, Noise, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { TextureLoader } from 'three'
import * as THREE from 'three'
import gsap from 'gsap'
import './CardStack3D.css'

// Album covers - rock classics (triplicated for infinite scroll)
const baseAlbums = [
  { cover: '/albums/abbey-road.jpg', spineColor: '#2a2a2a' },
  { cover: '/albums/paranoid.jpg', spineColor: '#1a1a1a' },
  { cover: '/albums/ramones.jpg', spineColor: '#1a1a3a' },
  { cover: '/albums/morning-glory.jpg', spineColor: '#3a2a1a' },
  { cover: '/albums/offspring.jpg', spineColor: '#3a1a1a' },
  { cover: '/albums/black-sabbath-due.jpg', spineColor: '#1a3a2a' },
]

// Triplicate for seamless infinite scroll
const albums = [
  ...baseAlbums.map((a, i) => ({ ...a, id: i + 1 })),
  ...baseAlbums.map((a, i) => ({ ...a, id: i + 7 })),
  ...baseAlbums.map((a, i) => ({ ...a, id: i + 13 })),
]

// Dust Particles Component
const DustParticles = () => {
  const pointsRef = useRef<THREE.Points>(null)
  const count = 300

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 25     // x
      pos[i + 1] = (Math.random() - 0.5) * 12 // y
      pos[i + 2] = (Math.random() - 0.5) * 15 // z
    }
    return pos
  }, [])

  useFrame(({ clock }) => {
    if (!pointsRef.current) return
    const time = clock.getElapsedTime() * 0.1
    pointsRef.current.rotation.y = time * 0.05

    // Gentle floating motion
    const posArray = pointsRef.current.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      posArray[i3 + 1] += Math.sin(time + i * 0.1) * 0.001
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.015}
        color="#ffffff"
        transparent
        opacity={0.25}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}

interface VinylBoxProps {
  index: number
  scrollX: number
  cover: string
  spineColor: string
  totalCards: number
  isHovered: boolean
  onHover: (hover: boolean) => void
}

// Single Vinyl Box with PBR materials
const VinylBox = ({ index, scrollX, cover, spineColor, totalCards, isHovered, onHover }: VinylBoxProps) => {
  const groupRef = useRef<THREE.Group>(null)
  const boxRef = useRef<THREE.Group>(null)
  const isAnimating = useRef(false)

  const coverTexture = useLoader(TextureLoader, cover)

  // Box dimensions - realistic vinyl sleeve
  const W = 0.04  // Width (spine thickness)
  const H = 1.6   // Height
  const D = 1.6   // Depth (cover size, square)

  // GSAP hover animation
  useEffect(() => {
    if (!boxRef.current || isAnimating.current) return

    if (isHovered) {
      isAnimating.current = true
      gsap.to(boxRef.current.rotation, {
        y: -0.35,
        duration: 0.6,
        ease: 'power3.out',
        onComplete: () => { isAnimating.current = false }
      })
      gsap.to(boxRef.current.position, {
        z: 0.4,
        duration: 0.4,
        ease: 'power2.out'
      })
    } else {
      isAnimating.current = true
      gsap.to(boxRef.current.rotation, {
        y: -0.7,
        duration: 0.5,
        ease: 'power2.inOut',
        onComplete: () => { isAnimating.current = false }
      })
      gsap.to(boxRef.current.position, {
        z: 0,
        duration: 0.3,
        ease: 'power2.in'
      })
    }
  }, [isHovered])

  useFrame(() => {
    if (!groupRef.current) return

    const cardSpacing = 0.35
    const baseX = index * cardSpacing
    const scrollOffset = scrollX * 0.04

    let x = baseX - scrollOffset
    const totalWidth = totalCards * cardSpacing

    // Infinite wrap
    const wrapThreshold = totalWidth * 0.5
    while (x < -wrapThreshold) x += totalWidth
    while (x > wrapThreshold) x -= totalWidth

    // Position boxes in a row
    groupRef.current.position.set(x * 4.5, 0, 0)

    // Set initial rotation (GSAP handles hover changes)
    if (boxRef.current && !isAnimating.current && !isHovered) {
      boxRef.current.rotation.x = -0.65
    } else if (boxRef.current) {
      boxRef.current.rotation.x = -0.65
    }
  })

  return (
    <group
      ref={groupRef}
      onPointerOver={(e) => { e.stopPropagation(); onHover(true) }}
      onPointerOut={() => onHover(false)}
    >
      {/* Box container - all faces inside here rotate together */}
      <group ref={boxRef} rotation={[-0.65, -0.7, 0]}>

        {/* ===== FRONT FACE (SPINE) ===== */}
        <mesh position={[0, 0, D / 2]}>
          <planeGeometry args={[W, H]} />
          <meshPhysicalMaterial
            color={spineColor}
            roughness={0.3}
            metalness={0.05}
            clearcoat={0.3}
            clearcoatRoughness={0.4}
            envMapIntensity={0.4}
          />
        </mesh>

        {/* ===== RIGHT FACE (COVER with album art) ===== */}
        <mesh position={[W / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[D, H]} />
          <meshPhysicalMaterial
            map={coverTexture}
            roughness={0.1}
            metalness={0}
            clearcoat={0.8}
            clearcoatRoughness={0.1}
            envMapIntensity={0.6}
          />
        </mesh>

        {/* Cover glossy overlay for extra shine */}
        <mesh position={[W / 2 + 0.003, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[D, H]} />
          <meshPhysicalMaterial
            color="#ffffff"
            transparent
            opacity={0.03}
            roughness={0}
            clearcoat={1}
          />
        </mesh>

        {/* ===== TOP FACE ===== */}
        <mesh position={[0, H / 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[W, D]} />
          <meshPhysicalMaterial
            color={spineColor}
            roughness={0.35}
            clearcoat={0.2}
            envMapIntensity={0.3}
          />
        </mesh>

        {/* ===== BACK FACE ===== */}
        <mesh position={[0, 0, -D / 2]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[W, H]} />
          <meshPhysicalMaterial
            color="#0a0a0a"
            roughness={0.9}
          />
        </mesh>

        {/* ===== LEFT FACE (back of cover) ===== */}
        <mesh position={[-W / 2, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[D, H]} />
          <meshPhysicalMaterial
            color="#111111"
            roughness={0.8}
          />
        </mesh>

        {/* ===== BOTTOM FACE ===== */}
        <mesh position={[0, -H / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[W, D]} />
          <meshPhysicalMaterial
            color={spineColor}
            roughness={0.5}
          />
        </mesh>

      </group>
    </group>
  )
}

// Scene with Environment
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
      {/* HDRI Environment for realistic reflections */}
      <Environment preset="studio" />

      {/* Lighting - reduced since Environment provides IBL */}
      <ambientLight intensity={0.4} />

      <spotLight
        position={[0, 10, 10]}
        angle={0.5}
        penumbra={1}
        intensity={1}
        castShadow
      />

      <directionalLight position={[10, 5, 5]} intensity={0.5} />
      <directionalLight position={[-10, 5, 5]} intensity={0.3} />

      {/* Accent colored lights */}
      <pointLight position={[-8, 2, 5]} intensity={0.3} color="#ff6b6b" />
      <pointLight position={[8, 2, 5]} intensity={0.3} color="#6b6bff" />

      {/* Dust particles */}
      <DustParticles />

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

// Post-processing effects
const PostProcessing = () => {
  return (
    <EffectComposer>
      <Bloom
        intensity={0.4}
        luminanceThreshold={0.2}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
      <Vignette
        darkness={0.4}
        offset={0.3}
      />
      <Noise
        opacity={0.025}
        blendFunction={BlendFunction.OVERLAY}
      />
      <ChromaticAberration
        offset={new THREE.Vector2(0.0008, 0.0008)}
      />
    </EffectComposer>
  )
}

// Main Component
const CardStack3D = () => {
  const [scrollX, setScrollX] = useState(0)
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const scrollRef = useRef({ current: 0 })
  const targetRef = useRef(0)
  const velocityRef = useRef(0)
  const isDragging = useRef(false)
  const lastX = useRef(0)
  const lastTime = useRef(Date.now())

  // Smooth animation loop with GSAP-like easing
  useEffect(() => {
    let animationId: number

    const animate = () => {
      const now = Date.now()
      const delta = Math.min((now - lastTime.current) / 16, 2)
      lastTime.current = now

      if (!isDragging.current) {
        velocityRef.current *= 0.94 // Smoother friction
        targetRef.current += velocityRef.current * delta

        if (Math.abs(velocityRef.current) < 0.00005) {
          velocityRef.current = 0
        }
      }

      const diff = targetRef.current - scrollRef.current.current
      scrollRef.current.current += diff * 0.06 * delta // Smoother interpolation

      setScrollX(scrollRef.current.current)
      animationId = requestAnimationFrame(animate)
    }

    animate()
    return () => cancelAnimationFrame(animationId)
  }, [])

  // Mouse wheel with smooth momentum
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
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#0a0a0a']} />
        <Suspense fallback={null}>
          <ShelfScene
            scrollX={scrollX}
            hoveredId={hoveredId}
            setHoveredId={setHoveredId}
          />
          <PostProcessing />
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
