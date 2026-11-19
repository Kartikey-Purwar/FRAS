import { Link } from 'react-router-dom'

export default function PublicHeader() {
  return (
    <header className="site-header public-header">
      <Link to="/" className="header-brand">
        <span className="logo-mark" aria-hidden="true">
          FR
        </span>
        <div>
          <p className="logo-name">FRAS</p>
          <p className="logo-subtitle">College attendance</p>
        </div>
      </Link>
    </header>
  )
}
