import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import VinylRecord from './components/VinylRecord'
import Header from './components/Header'
import './App.css'

function App() {
  return (
    <div className="app">
      <Header />

      <div className="canvas-container">
        <Canvas
          camera={{ position: [0, 2, 5], fov: 45 }}
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent' }}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={0.4} />
            <spotLight
              position={[10, 10, 10]}
              angle={0.15}
              penumbra={1}
              intensity={1}
              castShadow
            />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff4d4d" />

            <VinylRecord />

            <Environment preset="city" />
            <OrbitControls
              enableZoom={true}
              enablePan={false}
              minDistance={3}
              maxDistance={10}
              minPolarAngle={Math.PI / 6}
              maxPolarAngle={Math.PI / 2}
              autoRotate
              autoRotateSpeed={0.5}
            />
          </Suspense>
        </Canvas>
      </div>

      <div className="info-panel">
        <div className="info-content">
          <span className="info-label">Now Playing</span>
          <h2 className="info-title">Vinyl Experience</h2>
          <p className="info-description">
            Drag to rotate. Scroll to zoom.
          </p>
        </div>
      </div>

      <footer className="footer">
        <p>&copy; 2024 Vinile. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default App
