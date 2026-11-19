import { useEffect, useState } from 'react'
import { fetchAttendance } from '../services/api.js'

const emptyData = {
  records: [],
  totals: { present: 0, absent: 0, classes: 0 },
  percentage: null,
}

export function useAttendance(rollNumber) {
  const [data, setData] = useState(emptyData)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      const result = await fetchAttendance(rollNumber)
      if (!cancelled) {
        setData(result)
        setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [rollNumber])

  return { data, loading }
}
