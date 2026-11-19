import { Navigate, Route, Routes } from 'react-router-dom'
import StudentLayout from './components/StudentLayout.jsx'
import Attendance from './pages/Attendance.jsx'
import Home from './pages/Home.jsx'
import MarkAttendance from './pages/MarkAttendance.jsx'
import PhotoSetup from './pages/PhotoSetup.jsx'
import Profile from './pages/Profile.jsx'
import Results from './pages/Results.jsx'
import StaffComingSoon from './pages/StaffComingSoon.jsx'
import StudentAuth from './pages/StudentAuth.jsx'
import StudentDashboard from './pages/StudentDashboard.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/student" element={<StudentAuth />} />
      <Route path="/student/photo-setup" element={<PhotoSetup />} />
      <Route path="/staff" element={<StaffComingSoon />} />
      <Route element={<StudentLayout />}>
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/attendance" element={<Attendance />} />
        <Route path="/student/mark-attendance" element={<MarkAttendance />} />
        <Route path="/student/results" element={<Results />} />
        <Route path="/student/profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
