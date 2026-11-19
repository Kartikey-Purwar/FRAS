import { useContext } from 'react'
import { StudentSessionContext } from '../context/studentSessionContext.js'

export function useStudentSession() {
  const context = useContext(StudentSessionContext)
  if (!context) {
    throw new Error('useStudentSession must be used within StudentSessionProvider')
  }
  return context
}
