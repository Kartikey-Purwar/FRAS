import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import FormInput from '../components/FormInput.jsx'
import Notice from '../components/Notice.jsx'
import PublicHeader from '../components/PublicHeader.jsx'
import { useStudentSession } from '../hooks/useStudentSession.js'
import { authenticateStudent, registerStudent } from '../services/api.js'
import { hasErrors, validateLogin, validateSignup } from '../utils/validation.js'

const initialSignup = {
  name: '',
  rollNumber: '',
  email: '',
  password: '',
  confirmPassword: '',
}

const initialLogin = {
  rollNumber: '',
  password: '',
}

export default function StudentAuth() {
  const [mode, setMode] = useState('login')
  const [signup, setSignup] = useState(initialSignup)
  const [login, setLogin] = useState(initialLogin)
  const [signupErrors, setSignupErrors] = useState({})
  const [loginErrors, setLoginErrors] = useState({})
  const [banner, setBanner] = useState('')
  const { startDemoSession } = useStudentSession()
  const navigate = useNavigate()

  function updateSignup(event) {
    const { name, value } = event.target
    setSignup((prev) => ({ ...prev, [name]: value }))
  }

  function updateLogin(event) {
    const { name, value } = event.target
    setLogin((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSignup(event) {
    event.preventDefault()
    const errors = validateSignup(signup)
    setSignupErrors(errors)
    if (hasErrors(errors)) {
      setBanner('Please check the highlighted fields before continuing.')
      return
    }

    const response = await registerStudent({
      name: signup.name,
      rollNumber: signup.rollNumber,
      email: signup.email,
    })
    setBanner(response.message)
    startDemoSession({
      name: signup.name,
      rollNumber: signup.rollNumber,
      email: signup.email,
      source: 'signup',
    })
    navigate('/student/photo-setup')
  }

  async function handleLogin(event) {
    event.preventDefault()
    const errors = validateLogin(login)
    setLoginErrors(errors)
    if (hasErrors(errors)) {
      setBanner('Please check the highlighted fields. This login is a frontend demonstration only.')
      return
    }

    const response = await authenticateStudent({
      rollNumber: login.rollNumber,
      password: login.password,
    })
    setBanner(response.message)
    startDemoSession({
      rollNumber: login.rollNumber,
      source: 'login',
    })
    navigate('/student/dashboard')
  }

  return (
    <div className="app-frame">
      <PublicHeader />
      <main className="page auth-page">
        <Link to="/" className="back-link">
          Back to home
        </Link>
        <section className="card auth-card">
          <h1>Student Portal</h1>
          <p className="muted">Log in or create a demonstration student session.</p>

          <div className="mode-switch" role="tablist" aria-label="Authentication mode">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              className={mode === 'login' ? 'is-active' : ''}
              onClick={() => {
                setMode('login')
                setBanner('')
              }}
            >
              Login
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'signup'}
              className={mode === 'signup' ? 'is-active' : ''}
              onClick={() => {
                setMode('signup')
                setBanner('')
              }}
            >
              Sign up
            </button>
          </div>

          {banner ? <Notice>{banner}</Notice> : null}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} noValidate>
              <FormInput
                id="login-roll"
                name="rollNumber"
                label="College roll number"
                autoComplete="username"
                value={login.rollNumber}
                onChange={updateLogin}
                error={loginErrors.rollNumber}
              />
              <FormInput
                id="login-password"
                name="password"
                type="password"
                label="Password"
                autoComplete="current-password"
                value={login.password}
                onChange={updateLogin}
                error={loginErrors.password}
              />
              <button type="submit" className="btn btn-primary btn-full">
                Continue
              </button>
              <p className="form-switch">
                New student?{' '}
                <button type="button" className="text-button" onClick={() => setMode('signup')}>
                  Create an account
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleSignup} noValidate>
              <FormInput
                id="signup-name"
                name="name"
                label="Student name"
                autoComplete="name"
                value={signup.name}
                onChange={updateSignup}
                error={signupErrors.name}
              />
              <FormInput
                id="signup-roll"
                name="rollNumber"
                label="College roll number"
                autoComplete="username"
                value={signup.rollNumber}
                onChange={updateSignup}
                error={signupErrors.rollNumber}
              />
              <FormInput
                id="signup-email"
                name="email"
                type="email"
                label="College email address"
                autoComplete="email"
                value={signup.email}
                onChange={updateSignup}
                error={signupErrors.email}
              />
              <FormInput
                id="signup-password"
                name="password"
                type="password"
                label="Password"
                autoComplete="new-password"
                hint="At least 8 characters, including a letter and a number."
                value={signup.password}
                onChange={updateSignup}
                error={signupErrors.password}
              />
              <FormInput
                id="signup-confirm"
                name="confirmPassword"
                type="password"
                label="Confirm password"
                autoComplete="new-password"
                value={signup.confirmPassword}
                onChange={updateSignup}
                error={signupErrors.confirmPassword}
              />
              <button type="submit" className="btn btn-primary btn-full">
                Continue to photo setup
              </button>
              <p className="form-switch">
                Already have a session?{' '}
                <button type="button" className="text-button" onClick={() => setMode('login')}>
                  Log in
                </button>
              </p>
            </form>
          )}
        </section>
      </main>
    </div>
  )
}
