import { Link, useLocation } from 'react-router-dom'
import './NavBar.css'

// Section anchors for the inline sub-item lists. Left empty for now (page
// content is a stub); add { label, id } entries here once the pages have
// section anchors to smooth-scroll to.
const SECTIONS = {
  '/about': [],
  '/methodology': [],
}

function scrollToId(id) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

function NavBar() {
  const location = useLocation()
  const path = location.pathname

  // Clicking the link for the page you're already on shouldn't reload the
  // route (which would briefly tear down the section list); just scroll to top.
  function handleActiveClick(targetPath, e) {
    if (path === targetPath) {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <nav className="navbar">
      <div className="navbar-links">
        <Link to="/">Map</Link>

        <div className="navbar-item">
          <Link to="/about" onClick={(e) => handleActiveClick('/about', e)}>About</Link>
          {path === '/about' && SECTIONS['/about'].length > 0 && (
            <div className="navbar-subitems">
              {SECTIONS['/about'].map(s => (
                <button key={s.id} className="navbar-subitem" onClick={() => scrollToId(s.id)}>
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="navbar-item">
          <Link to="/methodology" onClick={(e) => handleActiveClick('/methodology', e)}>Methodology</Link>
          {path === '/methodology' && SECTIONS['/methodology'].length > 0 && (
            <div className="navbar-subitems">
              {SECTIONS['/methodology'].map(s => (
                <button key={s.id} className="navbar-subitem" onClick={() => scrollToId(s.id)}>
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <Link to="/database">Database</Link>
      </div>
    </nav>
  )
}

export default NavBar
