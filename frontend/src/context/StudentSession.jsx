import { useCallback, useMemo, useState } from 'react'
import { StudentSessionContext } from './studentSessionContext.js'

const emptyPhotoSetup = {
  liveCaptured: false,
  uploaded: false,
  skipped: false,
}

export function StudentSessionProvider({ children }) {
  const [session, setSession] = useState(null)

  const startDemoSession = useCallback((data) => {
    setSession({
      name: data.name?.trim() || '',
      rollNumber: data.rollNumber.trim(),
      email: data.email?.trim() || '',
      source: data.source,
      photoSetup: { ...emptyPhotoSetup, ...(data.photoSetup || {}) },
    })
  }, [])

  const updatePhotoSetup = useCallback((patch) => {
    setSession((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        photoSetup: { ...prev.photoSetup, ...patch },
      }
    })
  }, [])

  const logout = useCallback(() => {
    setSession(null)
  }, [])

  const value = useMemo(
    () => ({ session, startDemoSession, updatePhotoSetup, logout }),
    [session, startDemoSession, updatePhotoSetup, logout],
  )

  return (
    <StudentSessionContext.Provider value={value}>
      {children}
    </StudentSessionContext.Provider>
  )
}
