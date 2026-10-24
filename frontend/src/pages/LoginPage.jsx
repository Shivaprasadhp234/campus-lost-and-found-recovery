import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { errorMessage } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { ErrorNotice, Field } from '../components/ui'
import { homeFor } from '../utils/format'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      const user = await login(form.email, form.password)
      navigate(homeFor(user.role), { replace: true })
    } catch (err) {
      setError(errorMessage(err, 'Invalid email or password.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login-page">
      <section className="login-intro">
        <div className="brand brand-large">
          <span className="brand-mark">PG</span>
          <span className="brand-text">
            <strong>PG Manager</strong>
            <small>Hostel &amp; PG operations</small>
          </span>
        </div>

        <div className="login-message">
          <h1>Your properties, rooms and tenants in one place.</h1>
          <p>Everything you need to run the day-to-day, without the paperwork.</p>
        </div>

        <div className="login-strip">
          <div>
            <strong>Owners</strong>
            <span>Properties and managers</span>
          </div>
          <div>
            <strong>Managers</strong>
            <span>Rooms, tenants and rent</span>
          </div>
          <div>
            <strong>Tenants</strong>
            <span>Their own room and records</span>
          </div>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <div className="login-heading">
            <h2>Sign in</h2>
            <p>Use the account provided by your owner or manager.</p>
          </div>

          {error && <ErrorNotice message={error} />}

          <form onSubmit={handleSubmit} className="stack">
            <Field label="Email address">
              <input
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(event) => update('email', event.target.value)}
                placeholder="you@example.com"
                required
              />
            </Field>

            <Field label="Password">
              <input
                type="password"
                autoComplete="current-password"
                value={form.password}
                onChange={(event) => update('password', event.target.value)}
                placeholder="Enter your password"
                required
              />
            </Field>

            <button type="submit" className="button button-primary button-block" disabled={busy}>
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}
