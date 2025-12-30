import { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Effects } from '@react-three/drei'
import * as THREE from 'three'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { extend } from '@react-three/fiber'

extend({ UnrealBloomPass })

let globalScrollProgress = 0

const POINTS_COUNT = 12000  // molti più punti per dettaglio

// FASE 1: Sfera sonora 3D (spherical equalizer)
function generateWavePositions(): Float32Array {
  const positions = new Float32Array(POINTS_COUNT * 3)

  const baseRadius = 2.0
  const rings = 100  // più anelli per griglia visibile
  const pointsPerRing = Math.floor(POINTS_COUNT / rings)

  for (let ring = 0; ring < rings; ring++) {
    // Phi: da polo nord (0) a polo sud (PI)
    const phi = (ring / (rings - 1)) * Math.PI

    for (let p = 0; p < pointsPerRing; p++) {
      const idx = (ring * pointsPerRing + p) * 3
      if (idx >= POINTS_COUNT * 3) break

      // Theta: angolo attorno all'asse Y (0 to 2PI)
      const theta = (p / pointsPerRing) * Math.PI * 2

      // Onde pronunciate sulla superficie (come le immagini)
      const wave1 = Math.sin(phi * 5) * 0.25              // onde latitudinali grandi
      const wave2 = Math.sin(theta * 4 + phi * 3) * 0.2   // onde diagonali
      const wave3 = Math.cos(theta * 6) * Math.sin(phi * 6) * 0.15  // pattern incrociato
      const wave4 = Math.sin(theta * 10 + phi * 10) * 0.08  // dettaglio fine
      const wave5 = Math.cos(phi * 3) * Math.sin(theta * 3) * 0.12  // blob effect

      // Raggio con deformazione totale
      const radius = baseRadius + wave1 + wave2 + wave3 + wave4 + wave5

      // Coordinate sferiche -> cartesiane
      positions[idx] = radius * Math.sin(phi) * Math.cos(theta)      // X
      positions[idx + 1] = radius * Math.cos(phi)                     // Y
      positions[idx + 2] = radius * Math.sin(phi) * Math.sin(theta)  // Z
    }
  }

  return positions
}

// FASE 2: Tunnel/Vortice 3D (puoi scrollare dentro!)
function generateSpiralPositions(): Float32Array {
  const positions = new Float32Array(POINTS_COUNT * 3)
  const turns = 12  // più giri = più denso
  const tunnelLength = 20  // tunnel più lungo

  for (let i = 0; i < POINTS_COUNT; i++) {
    const idx = i * 3
    const t = i / POINTS_COUNT

    // Angolo che gira più velocemente
    const angle = t * Math.PI * 2 * turns

    // Raggio: inizia largo, si stringe al centro, poi si riapre
    const bellCurve = Math.sin(t * Math.PI)  // 0 -> 1 -> 0
    const baseRadius = 2.8
    const minRadius = 0.8
    const radius = baseRadius - bellCurve * (baseRadius - minRadius)

    // Profondità lungo Z (tunnel)
    const depth = t * tunnelLength

    // Ondulazione organica del raggio
    const waveVariation = Math.sin(angle * 3) * 0.15
    // Rumore casuale
    const noise = (Math.random() - 0.5) * 0.08

    positions[idx] = Math.cos(angle) * (radius + waveVariation + noise)      // X
    positions[idx + 1] = Math.sin(angle) * (radius + waveVariation + noise)  // Y
    positions[idx + 2] = -depth                                               // Z (profondità tunnel)
  }

  return positions
}

// FASE 3: Vinile (cerchi concentrici PIATTI - come VinylDisc3D originale)
function generateVinylPositions(): Float32Array {
  const positions = new Float32Array(POINTS_COUNT * 3)
  const rings = 50
  const pointsPerRing = Math.floor(POINTS_COUNT / rings)

  for (let r = 0; r < rings; r++) {
    // Raggio da 0.4 a 2.5 (label interna + solchi)
    const radius = 0.4 + (r / rings) * 2.1

    for (let p = 0; p < pointsPerRing; p++) {
      const idx = (r * pointsPerRing + p) * 3
      const angle = (p / pointsPerRing) * Math.PI * 2

      // Piccola variazione per effetto organico
      const variation = Math.random() * 0.008

      // X e Z sono il piano orizzontale, Y è sempre 0 (piatto)
      positions[idx] = Math.cos(angle) * (radius + variation)      // X
      positions[idx + 1] = 0                                        // Y (piatto!)
      positions[idx + 2] = Math.sin(angle) * (radius + variation)  // Z
    }
  }

  return positions
}

// Interpolazione smooth tra 3 stati
function smoothStep(t: number): number {
  return t * t * (3 - 2 * t)
}

// Camera controller per tunnel effect
const CameraController = () => {
  const { camera } = useThree()

  useFrame(({ clock }) => {
    const scroll = globalScrollProgress
    const time = clock.getElapsedTime()

    if (scroll < 0.4) {
      // Fase 1: Camera guarda la sfera sonora
      camera.position.z = 8  // più lontano per vedere tutta la sfera
      camera.position.y = Math.sin(time * 0.5) * 0.2
      camera.position.x = Math.cos(time * 0.3) * 0.2
      camera.lookAt(0, 0, 0)
    } else if (scroll < 0.85) {
      // Fase 2: Camera entra nel tunnel!
      const tunnelProgress = (scroll - 0.4) / 0.45  // 0 -> 1 durante 0.4-0.85
      const eased = tunnelProgress * tunnelProgress * (3 - 2 * tunnelProgress)

      // Entra nel tunnel (Z va da 8 a -15)
      camera.position.z = 8 - eased * 23

      // Movimento circolare mentre attraversa il tunnel
      const spiral = tunnelProgress * Math.PI * 2
      camera.position.x = Math.sin(spiral) * 0.3 * (1 - tunnelProgress)
      camera.position.y = Math.cos(spiral) * 0.3 * (1 - tunnelProgress)

      // Guarda avanti nel tunnel con leggera oscillazione
      camera.lookAt(
        Math.sin(time * 2) * 0.1,
        Math.cos(time * 1.5) * 0.1,
        camera.position.z - 8
      )
    } else {
      // Fase 3: Esce dal tunnel e guarda il vinile dall'alto
      const exitProgress = (scroll - 0.85) / 0.15  // 0 -> 1
      const eased = exitProgress * exitProgress * (3 - 2 * exitProgress)

      // Posizione finale: sopra il vinile
      camera.position.z = -15 + eased * 19  // torna a Z=4
      camera.position.y = eased * 3  // sale sopra
      camera.position.x = 0

      // Guarda il vinile
      camera.lookAt(0, 0, 0)
    }
  })

  return null
}

// Componente particelle morphing
const MorphingParticles = () => {
  const pointsRef = useRef<THREE.Points>(null)
  const materialRef = useRef<THREE.PointsMaterial>(null)

  const wavePositions = useMemo(() => generateWavePositions(), [])
  const spiralPositions = useMemo(() => generateSpiralPositions(), [])
  const vinylPositions = useMemo(() => generateVinylPositions(), [])

  useFrame(({ clock }) => {
    if (!pointsRef.current || !materialRef.current) return

    const time = clock.getElapsedTime()
    const scroll = globalScrollProgress

    const posArray = pointsRef.current.geometry.attributes.position.array as Float32Array

    for (let i = 0; i < POINTS_COUNT; i++) {
      const idx = i * 3
      let targetX, targetY, targetZ

      if (scroll < 0.4) {
        // Fase 1: Sfera sonora animata (0 to 0.4)
        const morphT = smoothStep(scroll / 0.4)

        // Calcola coordinate sferiche per animazione
        const baseX = wavePositions[idx]
        const baseY = wavePositions[idx + 1]
        const baseZ = wavePositions[idx + 2]

        // Raggio base del punto
        const baseRadius = Math.sqrt(baseX * baseX + baseY * baseY + baseZ * baseZ)
        const theta = Math.atan2(baseZ, baseX)
        const phi = Math.acos(baseY / (baseRadius || 1))

        // Onde animate drammatiche sulla sfera (come equalizer audio)
        const wave1 = Math.sin(phi * 4 + time * 1.8) * 0.35           // onde grandi lente
        const wave2 = Math.sin(theta * 3 + time * 2.2) * 0.25         // onde longitudinali
        const wave3 = Math.cos(theta * 5 + phi * 5 + time * 2.5) * 0.2 // pattern diagonale
        const wave4 = Math.sin(phi * 8 + theta * 8 + time * 3) * 0.1  // vibrazioni fini
        const pulse = Math.sin(time * 1.5) * 0.1                       // respiro globale

        // Nuovo raggio animato con effetto pronunciato
        const animatedRadius = baseRadius + (wave1 + wave2 + wave3 + wave4 + pulse) * (1 - morphT * 0.7)

        // Posizioni animate
        const animX = animatedRadius * Math.sin(phi) * Math.cos(theta)
        const animY = animatedRadius * Math.cos(phi)
        const animZ = animatedRadius * Math.sin(phi) * Math.sin(theta)

        // Morph verso spirale
        targetX = animX + (spiralPositions[idx] - animX) * morphT
        targetY = animY + (spiralPositions[idx + 1] - animY) * morphT
        targetZ = animZ + (spiralPositions[idx + 2] - animZ) * morphT
      } else if (scroll < 0.85) {
        // Fase 2: Tunnel puro (0.4 to 0.85) - mantieni spirale
        targetX = spiralPositions[idx]
        targetY = spiralPositions[idx + 1]
        targetZ = spiralPositions[idx + 2]
      } else {
        // Fase 3: Spirale -> Vinile (0.85 to 1)
        const t = smoothStep((scroll - 0.85) / 0.15)
        targetX = spiralPositions[idx] + (vinylPositions[idx] - spiralPositions[idx]) * t
        targetY = spiralPositions[idx + 1] + (vinylPositions[idx + 1] - spiralPositions[idx + 1]) * t
        targetZ = spiralPositions[idx + 2] + (vinylPositions[idx + 2] - spiralPositions[idx + 2]) * t
      }

      posArray[idx] = targetX
      posArray[idx + 1] = targetY
      posArray[idx + 2] = targetZ
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true

    // Fase 1 (0-0.4): Onde
    // Fase 2 (0.4-0.85): Tunnel (camera entra)
    // Fase 3 (0.85-1): Vinile piatto dall'alto

    if (scroll < 0.4) {
      // Sfera: rotazione lenta e visibile
      const t = scroll / 0.4
      pointsRef.current.rotation.x = time * 0.08
      pointsRef.current.rotation.y = time * 0.12
      pointsRef.current.rotation.z = 0
      // Transizione graduale verso orientamento tunnel
      if (t > 0.5) {
        const tunnelPrep = (t - 0.5) * 2
        pointsRef.current.rotation.x += tunnelPrep * Math.PI * 0.4
      }
    } else if (scroll < 0.85) {
      // Dentro il tunnel: ruota con la camera
      const t = (scroll - 0.4) / 0.45
      pointsRef.current.rotation.x = Math.PI * 0.5  // tunnel frontale
      pointsRef.current.rotation.y = 0
      pointsRef.current.rotation.z = time * 0.3 * (1 + t)  // accelera rotazione
    } else {
      // Transizione a vinile: si appiattisce
      const t = (scroll - 0.85) / 0.15
      const eased = t * t * (3 - 2 * t)
      pointsRef.current.rotation.x = Math.PI * 0.5 * (1 - eased) + (-Math.PI * 0.4) * eased
      pointsRef.current.rotation.y = 0
      pointsRef.current.rotation.z = time * 0.2
    }

    // Colore: bianco sempre
    materialRef.current.color.setHSL(0, 0, 0.9)
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[wavePositions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        size={0.015}
        color="#ffffff"
        transparent
        opacity={0.85}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}

// Label vinile (appare nella fase finale)
const VinylLabel = () => {
  const groupRef = useRef<THREE.Group>(null)
  const pointsRef = useRef<THREE.Points>(null)

  const labelPositions = useMemo(() => {
    const positions: number[] = []
    const rings = 12
    const basePoints = 25

    for (let r = 1; r <= rings; r++) {
      const radius = (r / rings) * 0.23
      const pointsInRing = Math.floor(basePoints * (r / rings))

      for (let p = 0; p < pointsInRing; p++) {
        const angle = (p / pointsInRing) * Math.PI * 2
        positions.push(Math.cos(angle) * radius, Math.sin(angle) * radius, 0.01)
      }
    }

    return new Float32Array(positions)
  }, [])

  useFrame(({ clock }) => {
    if (!groupRef.current || !pointsRef.current) return

    const scroll = globalScrollProgress
    const time = clock.getElapsedTime()

    // Appare solo dopo 85% scroll (quando esci dal tunnel)
    const labelOpacity = Math.max(0, (scroll - 0.85) * 6.67)
    ;(pointsRef.current.material as THREE.PointsMaterial).opacity = labelOpacity

    // Scala appare gradualmente
    const scaleProgress = Math.max(0, (scroll - 0.8) * 5)
    groupRef.current.scale.setScalar(scaleProgress)

    // Posizione: segue dove finisce il vinile
    groupRef.current.position.z = 0

    // Rotazione sincronizzata col vinile
    if (scroll > 0.85) {
      groupRef.current.rotation.x = -1.3
      groupRef.current.rotation.z = time * 0.2
    }
  })

  return (
    <group ref={groupRef}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[labelPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.03} color="#ff3333" transparent opacity={0} sizeAttenuation />
      </points>
    </group>
  )
}

// Bloom
const BloomEffect = () => {
  const { size } = useThree()
  return (
    <Effects>
      {/* @ts-ignore */}
      <unrealBloomPass
        threshold={0.1}
        strength={0.8}
        radius={0.9}
        resolution={new THREE.Vector2(size.width, size.height)}
      />
    </Effects>
  )
}

// Main Component
const MorphingVinyl = () => {
  const [scrollProgress, setScrollProgress] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return
      const rect = sectionRef.current.getBoundingClientRect()
      const scrolled = -rect.top
      // 400vh totale - più spazio per il tunnel!
      const progress = Math.max(0, Math.min(1, scrolled / (window.innerHeight * 3)))
      globalScrollProgress = progress
      setScrollProgress(progress)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Determina fase corrente
  const phase = scrollProgress < 0.35 ? 'blob' : scrollProgress < 0.85 ? 'spiral' : 'vinyl'

  return (
    <section
      ref={sectionRef}
      style={{
        width: '100%',
        height: '400vh',
        backgroundColor: '#000000',
        position: 'relative',
      }}
    >
      {/* Canvas fixed */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          zIndex: 1,
        }}
      >
        <Canvas
          camera={{ position: [0, 0, 8], fov: 45 }}
          gl={{ antialias: true, alpha: true }}
        >
          <color attach="background" args={['#000000']} />
          <CameraController />
          <MorphingParticles />
          <VinylLabel />
          <BloomEffect />
        </Canvas>
      </div>

      {/* Phase 1: Sound */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          zIndex: 10,
          pointerEvents: 'none',
          opacity: phase === 'blob' ? Math.max(0, 1 - scrollProgress * 4) : 0,
          transition: 'opacity 0.3s',
        }}
      >
        <p style={{ fontSize: '10px', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '12px' }}>
          The
        </p>
        <h1 style={{ fontSize: 'clamp(40px, 10vw, 100px)', fontWeight: 800, letterSpacing: '-0.03em', color: '#fff', margin: 0 }}>
          SOUND
        </h1>
      </div>

      {/* Phase 2: Spiral - appare e scompare nel tunnel */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          zIndex: 10,
          pointerEvents: 'none',
          opacity: phase === 'spiral'
            ? Math.min(1, (scrollProgress - 0.35) * 8) * Math.max(0, 1 - (scrollProgress - 0.5) * 4)
            : 0,
          transition: 'opacity 0.2s',
        }}
      >
        <p style={{ fontSize: '10px', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '12px' }}>
          Enters The
        </p>
        <h1 style={{ fontSize: 'clamp(40px, 10vw, 100px)', fontWeight: 800, letterSpacing: '-0.03em', color: '#fff', margin: 0 }}>
          VORTEX
        </h1>
      </div>

      {/* Phase 3: Vinyl */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          zIndex: 10,
          pointerEvents: 'none',
          opacity: phase === 'vinyl' ? Math.min(1, (scrollProgress - 0.85) * 6) : 0,
          transition: 'opacity 0.3s',
        }}
      >
        <p style={{ fontSize: '10px', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '12px' }}>
          Becomes
        </p>
        <h1 style={{ fontSize: 'clamp(40px, 10vw, 100px)', fontWeight: 800, letterSpacing: '-0.03em', color: '#fff', margin: 0 }}>
          VINYL
        </h1>
      </div>

      {/* Scroll indicator */}
      <div
        style={{
          position: 'fixed',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          zIndex: 10,
          opacity: Math.max(0, 1 - scrollProgress * 3),
          pointerEvents: 'none',
        }}
      >
        <div style={{ width: '1px', height: '40px', background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.4))' }} />
        <span style={{ fontSize: '9px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Scroll</span>
      </div>
    </section>
  )
}

export default MorphingVinyl
