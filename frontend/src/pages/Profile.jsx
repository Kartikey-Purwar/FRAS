import { Link } from 'react-router-dom'
import Notice from '../components/Notice.jsx'
import { useStudentSession } from '../hooks/useStudentSession.js'
import { isPhotoSetupComplete } from '../utils/photoSetup.js'

export default function Profile() {
  const { session } = useStudentSession()
  const complete = isPhotoSetupComplete(session.photoSetup)

  return (
    <>
      <div className="page-heading">
        <h1>Profile</h1>
        <p className="muted">Demonstration session details for this browser visit only.</p>
      </div>

      <section className="card">
        <dl className="detail-list">
          <div>
            <dt>Student name</dt>
            <dd>{session.name || 'Not provided in this session'}</dd>
          </div>
          <div>
            <dt>College roll number</dt>
            <dd>{session.rollNumber}</dd>
          </div>
          <div>
            <dt>College email</dt>
            <dd>{session.email || 'Not provided in this session'}</dd>
          </div>
          <div>
            <dt>Photo setup</dt>
            <dd>{complete ? 'Both photographs were provided in this session' : 'Incomplete'}</dd>
          </div>
        </dl>
        <Link to="/student/photo-setup" className="btn btn-secondary">
          {complete ? 'Review photo setup' : 'Complete photo setup'}
        </Link>
      </section>

      <Notice>
        Passwords and photographs are not stored. This profile is session state for the frontend
        demonstration and will be replaced by a real student account API later.
      </Notice>
    </>
  )
}
