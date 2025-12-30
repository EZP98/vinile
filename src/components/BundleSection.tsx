import { useState } from 'react'
import './BundleSection.css'

interface Product {
  cover: string
  vinylColor: 'black' | 'white' | 'clear'
  label: string
  artist: string
  album: string
  year: string
  description: string
  tracklist: string[]
}

interface ProductProps {
  product: Product
  isHovered: boolean
  onHover: (hover: boolean) => void
  onClick: () => void
  isSpinning: boolean
}

interface DetailModalProps {
  product: Product
  onClose: () => void
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

// Detail Modal - Gatefold layout
const DetailModal = ({ product, onClose }: DetailModalProps) => {
  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
        <button className="detail-close" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Gatefold Layout */}
        <div className="detail-content">
          {/* Left - Vinyl Gatefold */}
          <div className="detail-gatefold">
            <div className="gatefold-inner">
              {/* Left panel (back cover) */}
              <div className="gatefold-left">
                <div className="gatefold-tracklist">
                  {product.tracklist.map((track, i) => (
                    <div key={i} className="track-item">
                      <span className="track-num">{String(i + 1).padStart(2, '0')}</span>
                      <span className="track-name">{track}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Center - Vinyl */}
              <div className="gatefold-center">
                <div className="gatefold-vinyl">
                  <VinylDisc color={product.vinylColor} />
                </div>
              </div>

              {/* Right panel (front cover) */}
              <div className="gatefold-right">
                <img src={product.cover} alt={product.album} />
              </div>
            </div>
          </div>

          {/* Right - Description */}
          <div className="detail-info">
            <span className="detail-year">{product.year}</span>
            <h2 className="detail-album">{product.album}</h2>
            <h3 className="detail-artist">{product.artist}</h3>
            <p className="detail-description">{product.description}</p>
            <button className="detail-cta">ADD TO COLLECTION</button>
          </div>
        </div>
      </div>
    </div>
  )
}

const VinylProduct = ({ product, isHovered, onHover, onClick, isSpinning }: ProductProps) => {
  return (
    <div
      className={`vinyl-product ${isSpinning ? 'spinning' : ''}`}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onClick={onClick}
    >
      <div className="vinyl-product-inner">
        {/* Vinyl disc - slides out on hover */}
        <div className={`vinyl-disc ${isHovered ? 'slide-out' : ''} ${isSpinning ? 'spin-out' : ''}`}>
          <VinylDisc color={product.vinylColor} />
        </div>

        {/* Album cover */}
        <div className="album-cover">
          <img src={product.cover} alt={product.album} />
        </div>
      </div>
      <span className="product-label">{product.album}</span>
    </div>
  )
}

const BundleSection = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [spinningIndex, setSpinningIndex] = useState<number | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const products: Product[] = [
    {
      cover: '/albums/abbey-road.jpg',
      vinylColor: 'white',
      label: 'The Beatles',
      artist: 'The Beatles',
      album: 'Abbey Road',
      year: '1969',
      description: 'The eleventh studio album by the English rock band the Beatles, released on 26 September 1969. Named after the street where EMI Studios is located, it was the last album recorded by the group.',
      tracklist: ['Come Together', 'Something', 'Maxwell\'s Silver Hammer', 'Oh! Darling', 'Octopus\'s Garden', 'I Want You', 'Here Comes the Sun', 'Because', 'Golden Slumbers']
    },
    {
      cover: '/albums/paranoid.jpg',
      vinylColor: 'black',
      label: 'Black Sabbath',
      artist: 'Black Sabbath',
      album: 'Paranoid',
      year: '1970',
      description: 'The second studio album by the English rock band Black Sabbath. It was released on 18 September 1970 and is often cited as one of the most influential heavy metal albums of all time.',
      tracklist: ['War Pigs', 'Paranoid', 'Planet Caravan', 'Iron Man', 'Electric Funeral', 'Hand of Doom', 'Rat Salad', 'Fairies Wear Boots']
    },
    {
      cover: '/albums/ramones.jpg',
      vinylColor: 'clear',
      label: 'Ramones',
      artist: 'Ramones',
      album: 'Ramones',
      year: '1976',
      description: 'The debut studio album by the American punk rock band Ramones. Released on April 23, 1976, it is widely considered one of the most influential albums in punk rock history.',
      tracklist: ['Blitzkrieg Bop', 'Beat on the Brat', 'Judy Is a Punk', 'I Wanna Be Your Boyfriend', 'Chain Saw', 'Now I Wanna Sniff Some Glue', '53rd & 3rd', 'Let\'s Dance']
    },
    {
      cover: '/albums/morning-glory.jpg',
      vinylColor: 'white',
      label: 'Oasis',
      artist: 'Oasis',
      album: '(What\'s the Story) Morning Glory?',
      year: '1995',
      description: 'The second studio album by English rock band Oasis. It was released on 2 October 1995 and became one of the best-selling albums in UK chart history.',
      tracklist: ['Hello', 'Roll with It', 'Wonderwall', 'Don\'t Look Back in Anger', 'Hey Now!', 'Some Might Say', 'Cast No Shadow', 'She\'s Electric', 'Morning Glory', 'Champagne Supernova']
    },
    {
      cover: '/albums/offspring.jpg',
      vinylColor: 'clear',
      label: 'The Offspring',
      artist: 'The Offspring',
      album: 'Americana',
      year: '1998',
      description: 'The fifth studio album by American rock band the Offspring. Released on November 17, 1998, it became one of their best-selling albums worldwide.',
      tracklist: ['Welcome', 'Have You Ever', 'Staring at the Sun', 'Pretty Fly (for a White Guy)', 'The Kids Aren\'t Alright', 'Feelings', 'She\'s Got Issues', 'Walla Walla', 'Why Don\'t You Get a Job?', 'Americana', 'Pay the Man']
    },
    {
      cover: '/albums/black-sabbath-due.jpg',
      vinylColor: 'black',
      label: 'Black Sabbath',
      artist: 'Black Sabbath',
      album: 'Vol. 4',
      year: '1972',
      description: 'The fourth studio album by English rock band Black Sabbath. Released on 25 September 1972, it marked a shift in the band\'s sound with more experimental and introspective themes.',
      tracklist: ['Wheels of Confusion', 'Tomorrow\'s Dream', 'Changes', 'FX', 'Supernaut', 'Snowblind', 'Cornucopia', 'Laguna Sunrise', 'St. Vitus Dance', 'Under the Sun']
    },
  ]

  const handleClick = (index: number) => {
    setSpinningIndex(index)
    setTimeout(() => {
      setSelectedProduct(products[index])
      setSpinningIndex(null)
    }, 600)
  }

  const handleClose = () => {
    setSelectedProduct(null)
  }

  return (
    <section className="bundle-section">
      <div className="bundle-container">
        {/* Header */}
        <div className="grid-header">
          <h1 className="grid-title">VINYL COLLECTION</h1>
          <p className="grid-subtitle">Discover our curated selection of classic albums</p>
        </div>

        {/* Vinyl Grid */}
        <div className="vinyl-grid">
          {products.map((product, index) => (
            <VinylProduct
              key={index}
              product={product}
              isHovered={hoveredIndex === index}
              onHover={(hover) => setHoveredIndex(hover ? index : null)}
              onClick={() => handleClick(index)}
              isSpinning={spinningIndex === index}
            />
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedProduct && (
        <DetailModal product={selectedProduct} onClose={handleClose} />
      )}
    </section>
  )
}

export default BundleSection
