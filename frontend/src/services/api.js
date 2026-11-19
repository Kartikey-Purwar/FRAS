/**
 * Placeholder service layer for a future Node.js/Express backend.
 * This frontend-only build does not send network requests or store accounts.
 */

export const EXAM_TYPES = [
  'Internal Examination',
  'Mid-Semester Examination',
  'End-Semester Examination',
]

export async function fetchAttendance(_rollNumber) {
  return {
    records: [],
    totals: {
      present: 0,
      absent: 0,
      classes: 0,
    },
    percentage: null,
  }
}

export async function lookupResult({ rollNumber, examType }) {
  if (!rollNumber || !examType) {
    throw new Error('Roll number and examination type are required.')
  }

  return {
    available: false,
    message:
      'Examination results are not available yet. Results will appear here once the college results service is connected. Access to another student’s records will be restricted by the backend.',
  }
}

export async function authenticateStudent(_credentials) {
  return {
    connected: false,
    message:
      'This login form is a frontend demonstration. No account is verified or stored on a server.',
  }
}

export async function registerStudent(_payload) {
  return {
    connected: false,
    message:
      'This sign-up form is a frontend demonstration. No account is registered or stored.',
  }
}
