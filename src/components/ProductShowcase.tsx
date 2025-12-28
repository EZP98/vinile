import { useEffect, useRef, useState } from 'react'
import HolographicCard from './HolographicCard'
import AnimatedText from './AnimatedText'
import './ProductShowcase.css'

const products = [
  {
    id: 1,
    title: 'Limited Edition',
    subtitle: 'Exclusive Release',
    price: '€49.99',
    variant: 'vinyl' as const,
    image: '/vinyl-cover-1.jpg'
  },
  {
    id: 2,
    title: 'Collector\'s Bundle',
    subtitle: 'Vinyl + CD + Poster',
    price: '€89.99',
    variant: 'bundle' as const,
    image: '/vinyl-cover-2.jpg'
  },
  {
    id: 3,
    title: 'Digital Album',
    subtitle: 'Hi-Res Audio',
    price: '€19.99',
    variant: 'cd' as const,
    image: '/vinyl-cover-3.jpg'
  }
]

const ProductShowcase = () => {
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className={`product-showcase ${isVisible ? 'visible' : ''}`}>
      {/* Background elements */}
      <div className="showcase-bg">
        <div className="showcase-gradient" />
        <div className="showcase-noise" />
      </div>

      <div className="showcase-container">
        <div className="showcase-header">
          <span className="showcase-label">Featured Products</span>
          <AnimatedText
            text="Choose Your Format"
            variant="heading"
            delay={200}
          />
          <p className="showcase-description">
            From classic vinyl to modern digital, experience music the way it was meant to be heard.
          </p>
        </div>

        <div className="showcase-grid">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="showcase-item"
              style={{ transitionDelay: `${index * 0.15}s` }}
            >
              <HolographicCard
                title={product.title}
                subtitle={product.subtitle}
                price={product.price}
                variant={product.variant}
              />
            </div>
          ))}
        </div>

        <div className="showcase-cta">
          <button className="view-all-btn">
            <span>View All Products</span>
            <div className="btn-arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="showcase-decoration">
        <div className="floating-vinyl floating-vinyl-1" />
        <div className="floating-vinyl floating-vinyl-2" />
      </div>
    </section>
  )
}

export default ProductShowcase
