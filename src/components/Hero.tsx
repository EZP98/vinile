import { useEffect, useRef } from 'react'
import AnimatedText, { AnimatedChars } from './AnimatedText'
import './Hero.css'

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return

      const { clientX, clientY } = e
      const { innerWidth, innerHeight } = window

      const x = (clientX / innerWidth - 0.5) * 20
      const y = (clientY / innerHeight - 0.5) * 20

      heroRef.current.style.setProperty('--mouse-x', `${x}px`)
      heroRef.current.style.setProperty('--mouse-y', `${y}px`)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <section ref={heroRef} className="hero">
      {/* Animated gradient orbs */}
      <div className="hero-orb hero-orb-1" />
      <div className="hero-orb hero-orb-2" />
      <div className="hero-orb hero-orb-3" />

      {/* Grid pattern overlay */}
      <div className="hero-grid" />

      <div className="hero-content">
        <div className="hero-label">
          <span className="hero-label-dot" />
          <AnimatedChars text="NEW RELEASE" delay={200} />
        </div>

        <AnimatedText
          text="VINYL"
          variant="hero"
          delay={400}
          className="gradient-text"
        />

        <AnimatedText
          text="EXPERIENCE"
          variant="hero"
          delay={600}
          className="hero-title-outline"
        />

        <AnimatedText
          text="Immerse yourself in the warm, rich sound of analog music. Discover our curated collection of premium vinyl records."
          variant="subtitle"
          delay={800}
          className="hero-description"
        />

        <div className="hero-cta">
          <button className="btn-primary">
            <span>Explore Collection</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
          <button className="btn-secondary">
            <span>Watch Video</span>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </button>
        </div>

        <div className="hero-stats">
          <div className="stat">
            <span className="stat-value">500+</span>
            <span className="stat-label">Records</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <span className="stat-value">50k+</span>
            <span className="stat-label">Collectors</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <span className="stat-value">4.9</span>
            <span className="stat-label">Rating</span>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="scroll-indicator">
        <div className="scroll-line" />
        <span>Scroll</span>
      </div>
    </section>
  )
}

export default Hero
