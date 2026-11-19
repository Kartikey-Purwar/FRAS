import { Link } from 'react-router-dom'
import PublicHeader from '../components/PublicHeader.jsx'

export default function StaffComingSoon() {
  return (
    <div className="app-frame">
      <PublicHeader />
      <main className="page">
        <section className="card coming-soon">
          <p className="eyebrow">Faculty tools</p>
          <h1>Staff and Faculty Portal — Coming Soon</h1>
          <p>
            Attendance administration, class rosters, and faculty reporting are planned for a
            later release. Student tools remain available from the Student Portal.
          </p>
          <div className="button-row">
            <Link to="/" className="btn btn-primary">
              Back to home
            </Link>
            <Link to="/student" className="btn btn-secondary">
              Student portal
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
