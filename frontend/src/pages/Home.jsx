import { GraduationCap, University } from 'lucide-react'
import PortalCard from '../components/PortalCard.jsx'
import PublicHeader from '../components/PublicHeader.jsx'

export default function Home() {
  return (
    <div className="app-frame">
      <PublicHeader />
      <main className="page landing">
        <section className="hero">
          <p className="eyebrow">College attendance platform</p>
          <h1>FRAS — Face Recognition Attendance System</h1>
          <p className="lede">Smart attendance management for our college.</p>
        </section>

        <section className="portal-grid" aria-label="Choose a portal">
          <PortalCard
            to="/student"
            icon={GraduationCap}
            title="Student Portal"
            description="Register or log in, complete photo setup, view attendance, and look up examination results."
            actionLabel="Enter student portal"
          />
          <PortalCard
            to="/staff"
            icon={University}
            title="Staff / Faculty Portal"
            description="Faculty tools for attendance administration are planned for a later release."
            actionLabel="View staff portal"
          />
        </section>
      </main>
    </div>
  )
}
