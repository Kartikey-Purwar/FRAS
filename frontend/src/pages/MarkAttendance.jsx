import { Camera } from 'lucide-react'
import Notice from '../components/Notice.jsx'

export default function MarkAttendance() {
  return (
    <>
      <div className="page-heading">
        <h1>Mark attendance</h1>
        <p className="muted">
          Camera-based attendance is under development and is not available in this version.
        </p>
      </div>

      <section className="card upcoming-card">
        <span className="portal-icon" aria-hidden="true">
          <Camera size={22} strokeWidth={1.75} />
        </span>
        <h2>Attendance system coming soon</h2>
        <p>
          Students will not be able to mark themselves present or absent. Attendance will be
          recorded only after a verified camera session.
        </p>
        <ol className="flow-list">
          <li>Camera capture</li>
          <li>MTCNN face detection</li>
          <li>Face recognition</li>
          <li>Student verification</li>
          <li>Backend API</li>
          <li>Attendance record</li>
        </ol>
        <Notice>
          MTCNN is planned for face detection only. It is not a complete identity-recognition
          system on its own. No recognition results or confidence scores are shown here.
        </Notice>
        <button type="button" className="btn btn-primary" disabled>
          Attendance system coming soon
        </button>
      </section>
    </>
  )
}
