import Header from './components/Header'
import BundleSection from './components/BundleSection'
import './App.css'

function App() {
  return (
    <div className="app">
      <Header />

      {/* Bundle Section - 3 Vinyls */}
      <BundleSection />

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <span className="footer-logo">VINILE</span>
          <div className="footer-links">
            <a href="#collection">COLLECTION</a>
            <a href="#about">ABOUT</a>
            <a href="#contact">CONTACT</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
