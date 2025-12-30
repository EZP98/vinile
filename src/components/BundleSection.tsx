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
      gsap.utils.toArray<HTMLElement>('.vinyl-viewport').forEach((section) => {
        const img = section.querySelector('.vinyl-image') as HTMLElement

        // Entry: scale up and fade in from below
        gsap.fromTo(img,
          { scale: 0.8, opacity: 0, y: 100 },
          {
            scale: 1,
            opacity: 1,
            y: 0,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'top center',
              scrub: 1,
            }
          }
        )

        // Exit: slide up and fade out
        gsap.to(img, {
          y: -150,
          scale: 0.9,
          opacity: 0,
          ease: 'power2.in',
          scrollTrigger: {
            trigger: section,
            start: 'bottom center',
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
          <div className="vinyl-sticky">
            <img src={vinyl.src} alt={vinyl.alt} className="vinyl-image" />
          </div>
        </section>
      ))}
    </div>
  )
}

export default BundleSection
