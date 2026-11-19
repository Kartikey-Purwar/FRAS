import AttendanceChart from '../components/AttendanceChart.jsx'
import AttendanceTable from '../components/AttendanceTable.jsx'
import { useStudentSession } from '../hooks/useStudentSession.js'
import { useAttendance } from '../hooks/useAttendance.js'

export default function Attendance() {
  const { session } = useStudentSession()
  const { data, loading } = useAttendance(session.rollNumber)

  return (
    <>
      <div className="page-heading">
        <h1>Attendance</h1>
        <p className="muted">
          Records will load from the FRAS attendance service when it is connected.
        </p>
      </div>
      {loading ? <p className="muted">Checking attendance records…</p> : null}
      <AttendanceChart totals={data.totals} percentage={data.percentage} />
      <AttendanceTable records={data.records} />
    </>
  )
}
