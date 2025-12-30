import './Header.css'

const Header = () => {
  return (
    <header className="header">
      <a href="/" className="logo">VINILE</a>

      <nav className="nav">
        <a href="#collection" className="nav-link">
          <span className="nav-text">COLLECTION</span>
          <span className="nav-text-hover">COLLECTION</span>
        </a>
        <a href="#about" className="nav-link">
          <span className="nav-text">ABOUT</span>
          <span className="nav-text-hover">ABOUT</span>
        </a>
        <a href="#contact" className="nav-link">
          <span className="nav-text">CONTACT</span>
          <span className="nav-text-hover">CONTACT</span>
        </a>
      </nav>
    </header>
  )
}

export default Header
