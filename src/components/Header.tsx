const Header = () => {
  return (
    <header className="header">
      <a href="/" className="logo">
        <div className="logo-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" fill="none" />
            <circle cx="12" cy="12" r="3" fill="white" />
          </svg>
        </div>
        <span className="logo-text">Vinile</span>
      </a>

      <nav className="nav">
        <a href="#collection" className="nav-link">Collection</a>
        <a href="#about" className="nav-link">About</a>
        <a href="#contact" className="nav-link">Contact</a>
      </nav>
    </header>
  )
}

export default Header
