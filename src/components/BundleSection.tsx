import { useState } from 'react'
import './BundleSection.css'

interface ProductProps {
  cover: string
  vinylColor: 'black' | 'white' | 'clear'
  label: string
  isHovered: boolean
  onHover: (hover: boolean) => void
}

// CSS-based vinyl disc
const VinylDisc = ({ color }: { color: 'black' | 'white' | 'clear' }) => {
  const colors = {
    black: { main: '#1a1a1a', groove: '#0a0a0a', label: '#333' },
    white: { main: '#e8e8e8', groove: '#d0d0d0', label: '#f5f5f5' },
    clear: { main: 'rgba(200,200,200,0.3)', groove: 'rgba(150,150,150,0.3)', label: 'rgba(255,255,255,0.5)' }
  }
  const c = colors[color]

  return (
    <svg viewBox="0 0 200 200" className="vinyl-svg">
      {/* Main disc */}
      <circle cx="100" cy="100" r="98" fill={c.main} />
      {/* Grooves */}
      {[90, 80, 70, 60, 50].map((r, i) => (
        <circle key={i} cx="100" cy="100" r={r} fill="none" stroke={c.groove} strokeWidth="0.5" />
      ))}
      {/* Label area */}
      <circle cx="100" cy="100" r="35" fill={c.label} />
      {/* Center hole */}
      <circle cx="100" cy="100" r="4" fill="#0a0a0a" />
      {/* Shine effect */}
      <ellipse cx="70" cy="70" rx="40" ry="30" fill="rgba(255,255,255,0.05)" transform="rotate(-45 70 70)" />
    </svg>
  )
}

const VinylProduct = ({ cover, vinylColor, label, isHovered, onHover }: ProductProps) => {
  return (
    <div
      className="vinyl-product"
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      <div className="vinyl-product-inner">
        {/* Vinyl disc - slides out on hover */}
        <div className={`vinyl-disc ${isHovered ? 'slide-out' : ''}`}>
          <VinylDisc color={vinylColor} />
        </div>

        {/* Album cover */}
        <div className="album-cover">
          <img src={cover} alt={label} />
        </div>
      </div>
      <span className="product-label">{label}</span>
    </div>
  )
}

const PlusIcon = () => (
  <div className="plus-icon">
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M9 0v18M0 9h18" stroke="currentColor" strokeWidth="1" />
    </svg>
  </div>
)

const BundleSection = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const products: { cover: string; vinylColor: 'black' | 'white' | 'clear'; label: string }[] = [
    {
      cover: '/albums/abbey-road.jpg',
      vinylColor: 'white',
      label: 'Édition Limitée'
    },
    {
      cover: '/albums/paranoid.jpg',
      vinylColor: 'black',
      label: 'Édition Standard'
    },
    {
      cover: '/albums/ramones.jpg',
      vinylColor: 'clear',
      label: 'Vinyle Instrumental'
    }
  ]

  return (
    <section className="bundle-section">
      <div className="bundle-container">
        {/* Products row */}
        <div className="bundle-products">
          {products.map((product, index) => (
            <div key={index} className="product-wrapper">
              <VinylProduct
                cover={product.cover}
                vinylColor={product.vinylColor}
                label={product.label}
                isHovered={hoveredIndex === index}
                onHover={(hover) => setHoveredIndex(hover ? index : null)}
              />
              {index < products.length - 1 && <PlusIcon />}
            </div>
          ))}
        </div>

        {/* Bundle info */}
        <div className="bundle-info">
          <h2 className="bundle-title">VINYL EXPERIENCE</h2>
          <p className="bundle-subtitle">
            ÉDITION LIMITÉE ABBEY ROAD + PARANOID + RAMONES
          </p>
          <button className="bundle-cta">
            Aggiungi al carrello (36€)
          </button>
        </div>
      </div>
    </section>
  )
}

export default BundleSection
