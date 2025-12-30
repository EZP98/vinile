import { useRef, useEffect, useState, Suspense, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, Noise, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import gsap from 'gsap'
import './VinylHero.css'

// Vinyl Disc Component
const VinylDisc = ({ scrollProgress }: { scrollProgress: number }) => {
  const discRef = useRef<THREE.Group>(null)
  const vinylRef = useRef<THREE.Mesh>(null)

  // Create groove texture
  const grooveTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 1024
    const ctx = canvas.getContext('2d')!

    // Black base
    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, 1024, 1024)

    const centerX = 512
    const centerY = 512

    // Draw concentric grooves with varying intensity
    for (let r = 100; r < 480; r += 1.5) {
      ctx.beginPath()
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2)
      const intensity = Math.sin(r * 0.1) * 0.3 + 0.7
      ctx.strokeStyle = `rgba(30, 30, 30, ${intensity})`
      ctx.lineWidth = 0.8
      ctx.stroke()
    }

    // Subtle radial shine
    const shine = ctx.createRadialGradient(400, 400, 0, 512, 512, 500)
    shine.addColorStop(0, 'rgba(60, 60, 60, 0.15)')
    shine.addColorStop(0.5, 'rgba(30, 30, 30, 0.05)')
    shine.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = shine
    ctx.fillRect(0, 0, 1024, 1024)

    // Center label - red gradient
    const labelGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 95)
    labelGradient.addColorStop(0, '#ff3333')
    labelGradient.addColorStop(0.6, '#cc2222')
    labelGradient.addColorStop(1, '#991111')

    ctx.beginPath()
    ctx.arc(centerX, centerY, 95, 0, Math.PI * 2)
    ctx.fillStyle = labelGradient
    ctx.fill()

    // Label ring
    ctx.beginPath()
    ctx.arc(centerX, centerY, 95, 0, Math.PI * 2)
    ctx.strokeStyle = '#aa1111'
    ctx.lineWidth = 2
    ctx.stroke()

    // Center hole
    ctx.beginPath()
    ctx.arc(centerX, centerY, 12, 0, Math.PI * 2)
    ctx.fillStyle = '#000000'
    ctx.fill()

    // Label text
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 24px "Inter", sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('VINILE', centerX, centerY - 10)
    ctx.font = '14px "Inter", sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.8)'
    ctx.fillText('EXPERIENCE', centerX, centerY + 15)

    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true
    return texture
  }, [])

  // Animate based on scroll
  useFrame((state) => {
    if (!discRef.current || !vinylRef.current) return

    const time = state.clock.getElapsedTime()

    // Base rotation
    vinylRef.current.rotation.z += 0.003

    // Scroll-based transformations
    const scale = 1 + scrollProgress * 0.5 // Scale up as you scroll
    const rotateX = -0.3 + scrollProgress * 0.4 // Tilt forward
    const posY = scrollProgress * -2 // Move down
    const posZ = scrollProgress * -3 // Move back

    discRef.current.scale.setScalar(scale)
    discRef.current.rotation.x = rotateX
    discRef.current.position.y = posY
    discRef.current.position.z = posZ

    // Subtle floating
    discRef.current.position.y += Math.sin(time * 0.5) * 0.05
  })

  return (
    <group ref={discRef}>
      {/* Main vinyl disc */}
      <mesh ref={vinylRef} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[3, 3, 0.03, 128]} />
        <meshPhysicalMaterial
          map={grooveTexture}
          roughness={0.15}
          metalness={0.9}
          clearcoat={0.8}
          clearcoatRoughness={0.1}
          envMapIntensity={1}
          color="#111111"
        />
      </mesh>

      {/* Edge highlight */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3, 0.02, 16, 128]} />
        <meshPhysicalMaterial
          color="#222222"
          roughness={0.1}
          metalness={1}
          clearcoat={1}
        />
      </mesh>

      {/* Inner glow ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.35, 0.4, 64]} />
        <meshBasicMaterial color="#ff4444" transparent opacity={0.6} />
      </mesh>
    </group>
  )
}

// Floating particles
const FloatingParticles = () => {
  const pointsRef = useRef<THREE.Points>(null)
  const count = 150

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 20
      pos[i + 1] = (Math.random() - 0.5) * 15
      pos[i + 2] = (Math.random() - 0.5) * 10 - 5
    }
    return pos
  }, [])

  useFrame(({ clock }) => {
    if (!pointsRef.current) return
    const time = clock.getElapsedTime() * 0.2
    pointsRef.current.rotation.y = time * 0.05

    const posArray = pointsRef.current.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      posArray[i3 + 1] += Math.sin(time + i * 0.1) * 0.002
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#ffffff"
        transparent
        opacity={0.3}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}

// Scene setup
const Scene = ({ scrollProgress }: { scrollProgress: number }) => {
  const { camera } = useThree()

  useEffect(() => {
    camera.position.set(0, 0, 8)
    camera.lookAt(0, 0, 0)
  }, [camera])

  return (
    <>
      <Environment preset="studio" />

      <ambientLight intensity={0.3} />
      <spotLight
        position={[0, 10, 5]}
        angle={0.4}
        penumbra={1}
        intensity={1.5}
        color="#ffffff"
      />
      <pointLight position={[-5, 0, 5]} intensity={0.5} color="#ff6666" />
      <pointLight position={[5, 0, 5]} intensity={0.5} color="#6666ff" />

      <FloatingParticles />
      <VinylDisc scrollProgress={scrollProgress} />
    </>
  )
}

// Post-processing
const PostProcessing = () => (
  <EffectComposer>
    <Bloom
      intensity={0.6}
      luminanceThreshold={0.1}
      luminanceSmoothing={0.9}
      mipmapBlur
    />
    <Vignette darkness={0.5} offset={0.2} />
    <Noise opacity={0.02} blendFunction={BlendFunction.OVERLAY} />
    <ChromaticAberration offset={new THREE.Vector2(0.001, 0.001)} />
  </EffectComposer>
)

// Main Component
const VinylHero = () => {
  const [scrollProgress, setScrollProgress] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Animate text on mount
    if (textRef.current) {
      const letters = textRef.current.querySelectorAll('.letter')
      gsap.fromTo(letters,
        { opacity: 0, y: 100, rotateX: -90 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 1,
          stagger: 0.08,
          ease: 'power3.out',
          delay: 0.5
        }
      )
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const progress = Math.max(0, Math.min(1, -rect.top / (window.innerHeight * 0.5)))
      setScrollProgress(progress)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const title = 'VINILE'

  return (
    <section ref={containerRef} className="vinyl-hero">
      <div className="vinyl-hero-canvas">
        <Canvas
          camera={{ fov: 45, position: [0, 0, 8] }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          dpr={[1, 2]}
        >
          <color attach="background" args={['#050505']} />
          <Suspense fallback={null}>
            <Scene scrollProgress={scrollProgress} />
            <PostProcessing />
          </Suspense>
        </Canvas>
      </div>

      <div className="vinyl-hero-content">
        <div className="vinyl-hero-label">
          <span className="dot"></span>
          <span>PREMIUM COLLECTION</span>
        </div>

        <h1 ref={textRef} className="vinyl-hero-title">
          {title.split('').map((char, i) => (
            <span key={i} className="letter">{char}</span>
          ))}
        </h1>

        <p className="vinyl-hero-subtitle">
          The sound of warmth
        </p>

        <div className="vinyl-hero-cta">
          <button className="cta-primary">
            <span>Explore</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="scroll-indicator">
        <div className="scroll-line"></div>
        <span>Scroll</span>
      </div>
    </section>
  )
}

export default VinylHero
