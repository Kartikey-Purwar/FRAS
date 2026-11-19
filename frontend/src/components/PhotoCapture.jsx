import { useEffect } from 'react'
import { useCamera } from '../hooks/useCamera.js'

export default function PhotoCapture({ preview, onCapture, onClear }) {
  const { videoRef, status, error, startCamera, stopCamera, captureFrame } = useCamera()

  useEffect(() => {
    return () => stopCamera()
  }, [stopCamera])

  function handleCapture() {
    const frame = captureFrame()
    if (frame) {
      onCapture(frame)
      stopCamera()
    }
  }

  function handleRetake() {
    onClear()
    startCamera()
  }

  return (
    <div className="photo-panel">
      <div className="photo-frame">
        {preview ? (
          <img src={preview} alt="Captured live photograph preview" />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={status === 'ready' ? 'is-visible' : 'is-hidden'}
          />
        )}
        {!preview && status !== 'ready' ? (
          <p className="photo-placeholder">Live camera preview will appear here.</p>
        ) : null}
      </div>

      {error ? <p className="field-error">{error}</p> : null}

      <div className="button-row">
        {!preview && status !== 'ready' ? (
          <button type="button" className="btn btn-primary" onClick={startCamera}>
            Enable camera
          </button>
        ) : null}
        {!preview && status === 'ready' ? (
          <>
            <button type="button" className="btn btn-primary" onClick={handleCapture}>
              Capture photo
            </button>
            <button type="button" className="btn btn-ghost" onClick={stopCamera}>
              Turn off camera
            </button>
          </>
        ) : null}
        {preview ? (
          <button type="button" className="btn btn-secondary" onClick={handleRetake}>
            Retake photo
          </button>
        ) : null}
      </div>
    </div>
  )
}
