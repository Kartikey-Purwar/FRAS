import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import Notice from '../components/Notice.jsx'
import PhotoCapture from '../components/PhotoCapture.jsx'
import PhotoUpload from '../components/PhotoUpload.jsx'
import PublicHeader from '../components/PublicHeader.jsx'
import { useStudentSession } from '../hooks/useStudentSession.js'
import { isPhotoSetupComplete } from '../utils/photoSetup.js'

export default function PhotoSetup() {
  const { session, updatePhotoSetup } = useStudentSession()
  const navigate = useNavigate()
  const [livePhoto, setLivePhoto] = useState(null)
  const [uploadPhoto, setUploadPhoto] = useState(null)

  if (!session) {
    return <Navigate to="/student" replace />
  }

  const complete = Boolean(livePhoto && uploadPhoto)
  const missing = !livePhoto || !uploadPhoto

  function continueToDashboard(skipped) {
    updatePhotoSetup({
      liveCaptured: Boolean(livePhoto),
      uploaded: Boolean(uploadPhoto),
      skipped,
    })
    setLivePhoto(null)
    setUploadPhoto(null)
    navigate('/student/dashboard')
  }

  return (
    <div className="app-frame">
      <PublicHeader />
      <main className="page">
        <div className="page-heading">
          <h1>Photo setup</h1>
          <p className="muted">
            Provide two clear photographs of the same student. Face detection and biometric
            enrollment are not active in this version.
          </p>
        </div>

        <Notice>
          Photographs stay in temporary browser memory only. They are not uploaded, stored, or
          saved in local storage. Image storage and biometric enrollment will be implemented in a
          future version.
        </Notice>

        <div className="photo-grid">
          <section className="card">
            <h2>Photo 1 — Live camera photo</h2>
            <p className="instruction">
              Ensure your face is clearly visible, well-lit, and unobstructed.
            </p>
            <PhotoCapture
              preview={livePhoto}
              onCapture={setLivePhoto}
              onClear={() => setLivePhoto(null)}
            />
          </section>

          <section className="card">
            <h2>Photo 2 — Upload a photograph</h2>
            <p className="instruction">
              Ensure your face is clearly visible, well-lit, and unobstructed.
            </p>
            <PhotoUpload
              preview={uploadPhoto}
              onSelect={setUploadPhoto}
              onClear={() => setUploadPhoto(null)}
            />
          </section>
        </div>

        {missing ? (
          <p className="status-note">
            Photo setup is incomplete until both photographs are provided.
            {isPhotoSetupComplete(session.photoSetup)
              ? ''
              : ' You can skip this step and finish it later from your profile.'}
          </p>
        ) : (
          <p className="status-note">Both photographs are ready in this browser session only.</p>
        )}

        <div className="button-row page-actions">
          <button
            type="button"
            className="btn btn-primary"
            disabled={!complete}
            onClick={() => continueToDashboard(false)}
          >
            Continue to dashboard
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => continueToDashboard(true)}
          >
            Skip for now
          </button>
          <Link to="/student/dashboard" className="btn btn-ghost">
            Back to dashboard
          </Link>
        </div>
      </main>
    </div>
  )
}
