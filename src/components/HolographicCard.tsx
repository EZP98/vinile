import { useRef, useState, useCallback } from 'react'
import './HolographicCard.css'

interface HolographicCardProps {
  title: string
  subtitle?: string
  price?: string
  image?: string
  variant?: 'vinyl' | 'cd' | 'bundle'
  onClick?: () => void
}

const HolographicCard = ({
  title,
  subtitle,
  price,
  image,
  variant = 'vinyl',
  onClick
}: HolographicCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 })

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const mouseX = e.clientX - centerX
    const mouseY = e.clientY - centerY

    const rotateXValue = (mouseY / (rect.height / 2)) * -15
    const rotateYValue = (mouseX / (rect.width / 2)) * 15

    setRotateX(rotateXValue)
    setRotateY(rotateYValue)

    // Glare position
    const glareX = ((e.clientX - rect.left) / rect.width) * 100
    const glareY = ((e.clientY - rect.top) / rect.height) * 100
    setGlarePosition({ x: glareX, y: glareY })
  }, [])

  const handleMouseLeave = useCallback(() => {
    setRotateX(0)
    setRotateY(0)
    setGlarePosition({ x: 50, y: 50 })
  }, [])

  return (
    <div
      ref={cardRef}
      className={`holographic-card ${variant}`}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
      }}
    >
      <div className="card-holographic-layer" />

      <div
        className="card-glare"
        style={{
          background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255,255,255,0.3) 0%, transparent 60%)`,
        }}
      />

      <div className="card-content">
        {image && (
          <div className="card-image">
            <img src={image} alt={title} />
            <div className="card-image-reflection" />
          </div>
        )}

        <div className="card-info">
          {subtitle && <span className="card-subtitle">{subtitle}</span>}
          <h3 className="card-title">{title}</h3>
          {price && <span className="card-price">{price}</span>}
        </div>

        <div className="card-badge">
          {variant === 'vinyl' && 'VINYL'}
          {variant === 'cd' && 'CD'}
          {variant === 'bundle' && 'BUNDLE'}
        </div>
      </div>

      <div className="card-border" />
    </div>
  )
}

export default HolographicCard
