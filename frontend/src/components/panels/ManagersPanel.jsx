import { useCallback, useEffect, useState } from 'react'
import { api, errorMessage } from '../../api/client'
import {
  Card,
  EmptyState,
  ErrorNotice,
  Field,
  Loading,
  SuccessNotice,
} from '../ui'
import { dateTime } from '../../utils/format'

const BLANK = { fullName: '', email: '', password: '' }

export default function ManagersPanel({ propertyId }) {
  const [managers, setManagers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [form, setForm] = useState(BLANK)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get(`/properties/${propertyId}/managers`)
      setManagers(data)
    } catch (err) {
      setError(errorMessage(err, 'Could not load managers.'))
    } finally {
      setLoading(false)
    }
  }, [propertyId])

  useEffect(() => {
    load()
  }, [load])

  async function addManager(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await api.post(`/properties/${propertyId}/managers`, form)
      setForm(BLANK)
      setNotice('Manager account created and assigned to this property.')
      await load()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="stack-lg">
      <Card title="Add a manager" subtitle="Create a manager account for this property.">
        <ErrorNotice message={error} />
        <SuccessNotice message={notice} />
        <form className="form-grid" onSubmit={addManager}>
          <Field label="Manager name">
            <input
              value={form.fullName}
              onChange={(event) => setForm({ ...form, fullName: event.target.value })}
              maxLength={120}
              required
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              maxLength={190}
              required
            />
          </Field>
          <Field label="Initial password" hint="Minimum 8 characters.">
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              minLength={8}
              maxLength={72}
              autoComplete="new-password"
              required
            />
          </Field>
          <div className="field-span">
            <button type="submit" className="button button-primary" disabled={busy}>
              {busy ? 'Creating…' : 'Create manager'}
            </button>
          </div>
        </form>
      </Card>

      <Card title="Assigned managers" subtitle={`${managers.length} manager${managers.length === 1 ? '' : 's'} on this property`}>
        {loading ? (
          <Loading label="Loading managers…" />
        ) : managers.length === 0 ? (
          <EmptyState title="No managers assigned" description="Add a manager to help run this property." />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Assigned</th>
                </tr>
              </thead>
              <tbody>
                {managers.map((manager) => (
                  <tr key={manager.userId}>
                    <td className="cell-title">{manager.fullName}</td>
                    <td>{manager.email}</td>
                    <td>{dateTime(manager.assignedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
