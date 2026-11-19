import { useCallback, useEffect, useRef, useState } from 'react'

export function useCamera() {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setStatus((current) => (current === 'ready' ? 'idle' : current))
  }, [])

  const startCamera = useCallback(async () => {
    setError('')

    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('unsupported')
      setError('This browser does not support camera access.')
      return
    }

    stopCamera()
    setStatus('requesting')

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setStatus('ready')
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setStatus('denied')
        setError('Camera permission was denied. You can enable it in your browser settings or upload a photograph instead.')
        return
      }
      if (err.name === 'NotFoundError' || err.name === 'OverconstrainedError') {
        setStatus('unavailable')
        setError('No camera was found on this device.')
        return
      }
      setStatus('error')
      setError('The camera could not be started. You can retry or upload a photograph instead.')
    }
  }, [stopCamera])

  const captureFrame = useCallback(() => {
    const video = videoRef.current
    if (!video || video.readyState < 2) return null

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const context = canvas.getContext('2d')
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', 0.9)
  }, [])

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }
    }
  }, [])

  return {
    videoRef,
    status,
    error,
    startCamera,
    stopCamera,
    captureFrame,
  }
}
