import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const VinylRecord = () => {
  const groupRef = useRef<THREE.Group>(null)
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

    // Draw concentric grooves
    const centerX = 512
    const centerY = 512

    for (let r = 80; r < 480; r += 2) {
      ctx.beginPath()
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2)
      ctx.strokeStyle = r % 4 === 0 ? '#1a1a1a' : '#0f0f0f'
      ctx.lineWidth = 1
      ctx.stroke()
    }

    // Center label area
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 75)
    gradient.addColorStop(0, '#ff4d4d')
    gradient.addColorStop(0.7, '#cc3333')
    gradient.addColorStop(1, '#aa2222')

    ctx.beginPath()
    ctx.arc(centerX, centerY, 75, 0, Math.PI * 2)
    ctx.fillStyle = gradient
    ctx.fill()

    // Center hole
    ctx.beginPath()
    ctx.arc(centerX, centerY, 8, 0, Math.PI * 2)
    ctx.fillStyle = '#0a0a0a'
    ctx.fill()

    // Label text
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 14px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('VINILE', centerX, centerY - 15)
    ctx.font = '10px Inter, sans-serif'
    ctx.fillText('EXPERIENCE', centerX, centerY + 5)

    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true
    return texture
  }, [])

  // Animate rotation
  useFrame((_, delta) => {
    if (vinylRef.current) {
      vinylRef.current.rotation.z += delta * 0.5
    }
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Vinyl Record */}
      <mesh ref={vinylRef} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[2, 2, 0.02, 64]} />
        <meshStandardMaterial
          map={grooveTexture}
          roughness={0.3}
          metalness={0.8}
          envMapIntensity={0.5}
        />
      </mesh>

      {/* Outer ring highlight */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.011, 0]}>
        <ringGeometry args={[1.95, 2, 64]} />
        <meshStandardMaterial
          color="#333333"
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>

      {/* Inner label */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <circleGeometry args={[0.3, 32]} />
        <meshStandardMaterial
          color="#ff4d4d"
          roughness={0.5}
          metalness={0.3}
        />
      </mesh>

      {/* Center spindle hole */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.013, 0]}>
        <ringGeometry args={[0.02, 0.04, 32]} />
        <meshStandardMaterial
          color="#1a1a1a"
          roughness={0.8}
        />
      </mesh>
    </group>
  )
}

export default VinylRecord
