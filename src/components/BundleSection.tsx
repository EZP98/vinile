import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './BundleSection.css'

gsap.registerPlugin(ScrollTrigger)

const vinyls = [
  { src: '/vinyl1.png', alt: 'Vinyl 1' },
  { src: '/vinyl2.png', alt: 'Vinyl 2' },
  { src: '/vinyl3.png', alt: 'Vinyl 3' },
  { src: '/vinyl4.png', alt: 'Vinyl 4' },
  { src: '/vinyl5.png', alt: 'Vinyl 5' },
]

const BundleSection = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate each vinyl on scroll
      gsap.utils.toArray<HTMLElement>('.vinyl-viewport').forEach((section) => {
        const img = section.querySelector('.vinyl-image') as HTMLElement

        // Entry animation - scale up and rotate
        gsap.fromTo(img,
          {
            scale: 0.6,
            rotation: -15,
            opacity: 0,
          },
          {
            scale: 1,
            rotation: 0,
            opacity: 1,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 80%',
              end: 'top 20%',
              scrub: 1,
            }
          }
        )

        // Parallax effect - slight movement
        gsap.to(img, {
          yPercent: -10,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          }
        })

        // Exit animation - scale down and fade
        gsap.to(img, {
          scale: 0.8,
          opacity: 0.3,
          scrollTrigger: {
            trigger: section,
            start: 'bottom 50%',
            end: 'bottom top',
            scrub: 1,
          }
        })
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div className="vinyl-showcase" ref={containerRef}>
      {vinyls.map((vinyl, index) => (
        <section key={index} className="vinyl-viewport">
          <img src={vinyl.src} alt={vinyl.alt} className="vinyl-image" />
        </section>
      ))}
    </div>
  )
}

export default BundleSection
