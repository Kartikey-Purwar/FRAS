import { LogOut, UserRound } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useStudentSession } from '../hooks/useStudentSession.js'

const NAV_ITEMS = [
  { to: '/student/dashboard', label: 'Dashboard' },
  { to: '/student/attendance', label: 'Attendance' },
  { to: '/student/mark-attendance', label: 'Mark attendance' },
  { to: '/student/results', label: 'Results' },
]

export default function Header() {
  const { session, logout } = useStudentSession()
  const navigate = useNavigate()
  const displayName = session?.name || session?.rollNumber || 'Student'

  function handleLogout() {
    logout()
    navigate('/student')
  }

  return (
    <header className="site-header">
      <div className="header-brand">
        <span className="logo-mark" aria-hidden="true">
          FR
        </span>
        <div>
          <p className="logo-name">FRAS</p>
          <p className="logo-subtitle">Student Portal</p>
        </div>
      </div>

      <nav className="header-nav" aria-label="Student portal">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="header-actions">
        <NavLink to="/student/profile" className="profile-chip">
          <UserRound size={16} strokeWidth={1.75} aria-hidden="true" />
          <span>{displayName}</span>
        </NavLink>
        <button type="button" className="btn btn-ghost" onClick={handleLogout}>
          <LogOut size={16} strokeWidth={1.75} aria-hidden="true" />
          Logout
        </button>
      </div>
    </header>
  )
}
