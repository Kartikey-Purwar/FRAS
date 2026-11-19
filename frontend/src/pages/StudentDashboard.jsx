import { Camera, ClipboardList, IdCard, PieChart } from 'lucide-react'
import { Link } from 'react-router-dom'
import AttendanceChart from '../components/AttendanceChart.jsx'
import Notice from '../components/Notice.jsx'
import { useStudentSession } from '../hooks/useStudentSession.js'
import { isPhotoSetupComplete } from '../utils/photoSetup.js'
import { useAttendance } from '../hooks/useAttendance.js'

const LINKS = [
  {
    to: '/student/attendance',
    icon: PieChart,
    title: 'Attendance overview',
    text: 'View recorded classes, present/absent totals, and the attendance table.',
  },
  {
    to: '/student/results',
    icon: ClipboardList,
    title: 'Results',
    text: 'Look up examination results by roll number and exam type.',
  },
  {
    to: '/student/mark-attendance',
    icon: Camera,
    title: 'Mark attendance',
    text: 'Camera-based attendance with face recognition is planned for a later release.',
  },
  {
    to: '/student/profile',
    icon: IdCard,
    title: 'Profile',
    text: 'Review your demonstration session and return to photo setup.',
  },
]

export default function StudentDashboard() {
  const { session } = useStudentSession()
  const { data } = useAttendance(session.rollNumber)
  const photosComplete = isPhotoSetupComplete(session.photoSetup)

  return (
    <>
      <div className="page-heading">
        <h1>Dashboard</h1>
        <p className="muted">
          Welcome{session.name ? `, ${session.name}` : ''}. Roll number {session.rollNumber}.
        </p>
      </div>

      <Notice>
        This portal is a frontend demonstration. Attendance, results, and face recognition are not
        connected to a backend yet.
      </Notice>

      {!photosComplete ? (
        <Notice tone="warning">
          Photo setup is incomplete.{' '}
          <Link to="/student/photo-setup">Complete photo setup</Link> when you are ready. Photographs
          are not stored in this version.
        </Notice>
      ) : null}

      <div className="dashboard-grid">
        {LINKS.map((item) => {
          const Icon = item.icon
          return (
            <Link key={item.to} to={item.to} className="card link-card">
              <span className="portal-icon" aria-hidden="true">
                <Icon size={20} strokeWidth={1.75} />
              </span>
              <h2>{item.title}</h2>
              <p>{item.text}</p>
            </Link>
          )
        })}
      </div>

      <AttendanceChart totals={data.totals} percentage={data.percentage} />
    </>
  )
}
