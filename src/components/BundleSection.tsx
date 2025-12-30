import './BundleSection.css'

const vinyls = [
  { src: '/vinyl1.png', alt: 'Vinyl 1' },
  { src: '/vinyl2.png', alt: 'Vinyl 2' },
  { src: '/vinyl3.png', alt: 'Vinyl 3' },
  { src: '/vinyl4.png', alt: 'Vinyl 4' },
  { src: '/vinyl5.png', alt: 'Vinyl 5' },
]

const BundleSection = () => {
  return (
    <div className="vinyl-showcase">
      {vinyls.map((vinyl, index) => (
        <section key={index} className="vinyl-viewport">
          <img src={vinyl.src} alt={vinyl.alt} className="vinyl-image" />
        </section>
      ))}
    </div>
  )
}

export default BundleSection
