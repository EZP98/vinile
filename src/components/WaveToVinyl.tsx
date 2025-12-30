import { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Effects } from '@react-three/drei'
import * as THREE from 'three'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { extend } from '@react-three/fiber'

extend({ UnrealBloomPass })

let globalScrollProgress = 0

// Numero di punti
const POINTS_COUNT = 8000

// Genera posizioni per le onde sonore (barre verticali ondulate)
function generateWavePositions(): Float32Array {
  const positions = new Float32Array(POINTS_COUNT * 3)
  const waves = 40 // numero di barre
  const pointsPerWave = POINTS_COUNT / waves

  for (let w = 0; w < waves; w++) {
    const x = (w / waves - 0.5) * 8 // distribuito orizzontalmente

    for (let p = 0; p < pointsPerWave; p++) {
      const i = (w * pointsPerWave + p) * 3
      const heightRatio = p / pointsPerWave

      // Altezza della barra (varia per creare pattern audio)
      const waveHeight = Math.sin(w * 0.5) * 0.5 + Math.sin(w * 0.3) * 0.3 + 0.5
      const maxHeight = waveHeight * 2

      positions[i] = x + (Math.random() - 0.5) * 0.05 // x con un po' di variazione
      positions[i + 1] = (heightRatio - 0.5) * maxHeight // y - altezza della barra
      positions[i + 2] = (Math.random() - 0.5) * 0.1 // z - piccola profondità
    }
  }

  return positions
}

// Genera posizioni per il vinile (cerchi concentrici)
function generateVinylPositions(): Float32Array {
  const positions = new Float32Array(POINTS_COUNT * 3)
  const rings = 50
  const pointsPerRing = POINTS_COUNT / rings

  for (let r = 0; r < rings; r++) {
    const radius = 0.3 + (r / rings) * 2.2 // da 0.3 a 2.5

    for (let p = 0; p < pointsPerRing; p++) {
      const i = (r * pointsPerRing + p) * 3
      const angle = (p / pointsPerRing) * Math.PI * 2

      // Aggiungi variazione per effetto organico
      const radiusVariation = Math.random() * 0.02

      positions[i] = Math.cos(angle) * (radius + radiusVariation)
      positions[i + 1] = Math.sin(angle) * (radius + radiusVariation)
      positions[i + 2] = 0
    }
  }

  return positions
}

// Componente particelle che morphano
const MorphingParticles = () => {
  const pointsRef = useRef<THREE.Points>(null)
  const materialRef = useRef<THREE.PointsMaterial>(null)

  // Posizioni iniziali (onde) e finali (vinile)
  const wavePositions = useMemo(() => generateWavePositions(), [])
  const vinylPositions = useMemo(() => generateVinylPositions(), [])

  // Posizioni correnti (interpolate)
  const currentPositions = useMemo(() => new Float32Array(POINTS_COUNT * 3), [])

  // Inizializza con posizioni onde
  useEffect(() => {
    currentPositions.set(wavePositions)
  }, [])

  useFrame(({ clock }) => {
    if (!pointsRef.current || !materialRef.current) return

    const time = clock.getElapsedTime()
    const scroll = globalScrollProgress

    const posArray = pointsRef.current.geometry.attributes.position.array as Float32Array

    for (let i = 0; i < POINTS_COUNT * 3; i += 3) {
      // Lerp tra wave e vinyl in base allo scroll
      const waveX = wavePositions[i]
      const waveY = wavePositions[i + 1]
      const waveZ = wavePositions[i + 2]

      const vinylX = vinylPositions[i]
      const vinylY = vinylPositions[i + 1]
      const vinylZ = vinylPositions[i + 2]

      // Aggiungi animazione alle onde quando scroll è basso
      const waveAnimation = Math.sin(time * 3 + waveX * 2) * 0.1 * (1 - scroll)

      // Interpolazione fluida
      posArray[i] = waveX + (vinylX - waveX) * scroll
      posArray[i + 1] = (waveY + waveAnimation) + (vinylY - (waveY + waveAnimation)) * scroll
      posArray[i + 2] = waveZ + (vinylZ - waveZ) * scroll
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true

    // Rotazione del vinile (aumenta con scroll)
    pointsRef.current.rotation.z = time * 0.1 * scroll

    // Inclinazione 3D
    pointsRef.current.rotation.x = scroll * -0.3

    // Colore che cambia: bianco -> rosso per la label
    const hue = 0 // rosso
    const saturation = scroll * 0.5
    const lightness = 0.7 + scroll * 0.1
    materialRef.current.color.setHSL(hue, saturation, lightness)
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[wavePositions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        size={0.015}
        color="#ffffff"
        transparent
        opacity={0.9}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}

// Label centrale del vinile (appare con scroll)
const VinylLabel = () => {
  const groupRef = useRef<THREE.Group>(null)
  const pointsRef = useRef<THREE.Points>(null)

  const labelPositions = useMemo(() => {
    const positions: number[] = []
    const rings = 15
    const basePoints = 30

    for (let r = 1; r <= rings; r++) {
      const radius = (r / rings) * 0.28
      const pointsInRing = Math.floor(basePoints * (r / rings))

      for (let p = 0; p < pointsInRing; p++) {
        const angle = (p / pointsInRing) * Math.PI * 2
        positions.push(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
          0.01
        )
      }
    }

    return new Float32Array(positions)
  }, [])

  useFrame(({ clock }) => {
    if (!groupRef.current || !pointsRef.current) return

    const scroll = globalScrollProgress
    const time = clock.getElapsedTime()

    // Appare solo dopo metà scroll
    const labelOpacity = Math.max(0, (scroll - 0.4) * 2.5)
    ;(pointsRef.current.material as THREE.PointsMaterial).opacity = labelOpacity

    // Scala
    groupRef.current.scale.setScalar(scroll)

    // Rotazione insieme al disco
    groupRef.current.rotation.z = time * 0.1 * scroll
    groupRef.current.rotation.x = scroll * -0.3
  })

  return (
    <group ref={groupRef}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[labelPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.025}
          color="#ff3333"
          transparent
          opacity={0}
          sizeAttenuation
        />
      </points>

      {/* Centro nero */}
      <mesh rotation={[0, 0, 0]} position={[0, 0, 0.02]}>
        <circleGeometry args={[0.05, 32]} />
        <meshBasicMaterial color="#0a0a0a" transparent opacity={globalScrollProgress} />
      </mesh>
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
        strength={0.4}
        radius={0.8}
        resolution={new THREE.Vector2(size.width, size.height)}
      />
    </Effects>
  )
}

// Scene
const Scene = () => {
  return (
    <>
      <MorphingParticles />
      <VinylLabel />
      <BloomEffect />
    </>
  )
}

// Main Component
const WaveToVinyl = () => {
  const [scrollProgress, setScrollProgress] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return
      const rect = sectionRef.current.getBoundingClientRect()
      const scrolled = -rect.top
      const progress = Math.max(0, Math.min(1, scrolled / (window.innerHeight * 1.5)))
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
        height: '250vh',
        backgroundColor: '#0A0A0A',
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
          camera={{ position: [0, 0, 5], fov: 50 }}
          gl={{ antialias: true, alpha: true }}
        >
          <color attach="background" args={['#0A0A0A']} />
          <Scene />
        </Canvas>
      </div>

      {/* Text overlay - Sound */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          zIndex: 10,
          pointerEvents: 'none',
          opacity: 1 - scrollProgress * 2,
        }}
      >
        <p
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: '11px',
            letterSpacing: '0.3em',
            color: 'rgba(255, 255, 255, 0.4)',
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}
        >
          The sound
        </p>
        <h1
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 'clamp(48px, 12vw, 120px)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: '#fff',
            margin: 0,
            lineHeight: 0.9,
          }}
        >
          WAVE
        </h1>
      </div>

      {/* Text overlay - Vinyl */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          zIndex: 10,
          pointerEvents: 'none',
          opacity: Math.max(0, (scrollProgress - 0.5) * 2),
        }}
      >
        <p
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: '11px',
            letterSpacing: '0.3em',
            color: 'rgba(255, 255, 255, 0.4)',
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}
        >
          Becomes
        </p>
        <h1
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 'clamp(48px, 12vw, 120px)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: '#fff',
            margin: 0,
            lineHeight: 0.9,
          }}
        >
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
          opacity: 1 - scrollProgress * 2,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            width: '1px',
            height: '40px',
            background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.4))',
          }}
        />
        <span
          style={{
            fontSize: '9px',
            letterSpacing: '0.2em',
            color: 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase',
          }}
        >
          Scroll
        </span>
      </div>
    </section>
  )
}

export default WaveToVinyl
