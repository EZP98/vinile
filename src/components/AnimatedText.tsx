import { useEffect, useRef, useState } from 'react'
import './AnimatedText.css'

interface AnimatedTextProps {
  text: string
  variant?: 'hero' | 'heading' | 'subtitle'
  delay?: number
  className?: string
}

const AnimatedText = ({
  text,
  variant = 'heading',
  delay = 0,
  className = ''
}: AnimatedTextProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [delay])

  const words = text.split(' ')

  return (
    <div
      ref={containerRef}
      className={`animated-text ${variant} ${isVisible ? 'visible' : ''} ${className}`}
    >
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="word-wrapper">
          <span
            className="word"
            style={{ transitionDelay: `${wordIndex * 0.08}s` }}
          >
            {word}
          </span>
          {wordIndex < words.length - 1 && <span className="space">&nbsp;</span>}
        </span>
      ))}
    </div>
  )
}

// Character by character animation
export const AnimatedChars = ({
  text,
  className = '',
  delay = 0
}: {
  text: string
  className?: string
  delay?: number
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [delay])

  return (
    <div
      ref={containerRef}
      className={`animated-chars ${isVisible ? 'visible' : ''} ${className}`}
    >
      {text.split('').map((char, i) => (
        <span
          key={i}
          className="char"
          style={{ transitionDelay: `${i * 0.03}s` }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </div>
  )
}

// Scramble text effect
export const ScrambleText = ({
  text,
  className = ''
}: {
  text: string
  className?: string
}) => {
  const [displayText, setDisplayText] = useState(text)
  const [isHovered, setIsHovered] = useState(false)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  useEffect(() => {
    if (!isHovered) {
      setDisplayText(text)
      return
    }

    let iteration = 0
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split('')
          .map((char, index) => {
            if (index < iteration || char === ' ') {
              return char
            }
            return chars[Math.floor(Math.random() * chars.length)]
          })
          .join('')
      )

      if (iteration >= text.length) {
        clearInterval(interval)
      }

      iteration += 1 / 2
    }, 30)

    return () => clearInterval(interval)
  }, [isHovered, text])

  return (
    <span
      className={`scramble-text ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {displayText}
    </span>
  )
}

export default AnimatedText
