import { Navigate, Outlet } from 'react-router-dom'
import { useStudentSession } from '../hooks/useStudentSession.js'
import Header from './Header.jsx'

export default function StudentLayout() {
  const { session } = useStudentSession()

  if (!session) {
    return <Navigate to="/student" replace />
  }

  return (
    <div className="app-frame">
      <Header />
      <main className="page">
        <Outlet />
      </main>
    </div>
  )
}
