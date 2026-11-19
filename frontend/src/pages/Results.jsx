import { useState } from 'react'
import FormInput from '../components/FormInput.jsx'
import Notice from '../components/Notice.jsx'
import { useStudentSession } from '../hooks/useStudentSession.js'
import { EXAM_TYPES, lookupResult } from '../services/api.js'
import { validateRequired, validateRollNumber } from '../utils/validation.js'

export default function Results() {
  const { session } = useStudentSession()
  const [rollNumber, setRollNumber] = useState(session.rollNumber || '')
  const [examType, setExamType] = useState('')
  const [errors, setErrors] = useState({})
  const [result, setResult] = useState(null)

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = {
      rollNumber: validateRollNumber(rollNumber),
      examType: validateRequired(examType, 'Examination type'),
    }
    setErrors(nextErrors)
    if (nextErrors.rollNumber || nextErrors.examType) {
      setResult(null)
      return
    }

    const response = await lookupResult({ rollNumber, examType })
    setResult(response)
  }

  return (
    <>
      <div className="page-heading">
        <h1>Results</h1>
        <p className="muted">Look up an examination result by roll number and exam type.</p>
      </div>

      <Notice>
        Entering a roll number here does not grant access to another student’s private results.
        Authorization will be enforced by the backend when results are connected.
      </Notice>

      <section className="card">
        <form onSubmit={handleSubmit} noValidate className="results-form">
          <FormInput
            id="result-roll"
            label="College roll number"
            value={rollNumber}
            onChange={(event) => setRollNumber(event.target.value)}
            error={errors.rollNumber}
          />
          <FormInput
            id="result-exam"
            as="select"
            label="Examination type"
            value={examType}
            onChange={(event) => setExamType(event.target.value)}
            error={errors.examType}
          >
            <option value="">Select an examination</option>
            {EXAM_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </FormInput>
          <button type="submit" className="btn btn-primary">
            Check result
          </button>
        </form>
      </section>

      {result && !result.available ? (
        <section className="card" role="status">
          <h2>Results unavailable</h2>
          <p>{result.message}</p>
        </section>
      ) : null}
    </>
  )
}
