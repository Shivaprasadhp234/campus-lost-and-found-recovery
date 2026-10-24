import { useCallback, useEffect, useState } from 'react'
import { api, errorMessage } from '../../api/client'
import {
  Card,
  EmptyState,
  ErrorNotice,
  Field,
  Loading,
  StatusBadge,
  SuccessNotice,
} from '../ui'
import { date, money, todayIso } from '../../utils/format'

function blankForm() {
  return { fullName: '', email: '', password: '', roomId: '', moveInDate: todayIso() }
}

export default function TenantsPanel({ propertyId }) {
  const [tenants, setTenants] = useState([])
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [form, setForm] = useState(blankForm)
  const [busy, setBusy] = useState(false)
  const [endingId, setEndingId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [tenantResponse, roomResponse] = await Promise.all([
        api.get(`/properties/${propertyId}/tenants`),
        api.get(`/properties/${propertyId}/rooms`),
      ])
      setTenants(tenantResponse.data)
      setRooms(roomResponse.data)
    } catch (err) {
      setError(errorMessage(err, 'Could not load tenants.'))
    } finally {
      setLoading(false)
    }
  }, [propertyId])

  useEffect(() => {
    load()
  }, [load])

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function addTenant(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await api.post(`/properties/${propertyId}/tenants`, {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        roomId: Number(form.roomId),
        moveInDate: form.moveInDate || null,
      })
      setForm(blankForm())
      setNotice('Tenant created and assigned.')
      await load()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  async function endAssignment(tenant) {
    if (!window.confirm(`End the assignment for ${tenant.fullName}? The room bed will be freed.`)) {
      return
    }
    setEndingId(tenant.assignmentId)
    setError('')
    setNotice('')
    try {
      await api.patch(`/tenant-assignments/${tenant.assignmentId}/end`)
      setNotice(`${tenant.fullName}'s assignment ended.`)
      await load()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setEndingId(null)
    }
  }

  const activeCount = tenants.filter((tenant) => tenant.status === 'ACTIVE').length

  return (
    <div className="stack-lg">
      <Card title="Add a tenant" subtitle="Create a tenant account and assign a room.">
        <ErrorNotice message={error} onRetry={load} />
        <SuccessNotice message={notice} />
        <form className="form-grid" onSubmit={addTenant}>
          <Field label="Tenant name">
            <input
              value={form.fullName}
              onChange={(event) => update('fullName', event.target.value)}
              maxLength={120}
              required
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              value={form.email}
              onChange={(event) => update('email', event.target.value)}
              maxLength={190}
              required
            />
          </Field>
          <Field label="Initial password" hint="Minimum 8 characters.">
            <input
              type="password"
              value={form.password}
              onChange={(event) => update('password', event.target.value)}
              minLength={8}
              maxLength={72}
              autoComplete="new-password"
              required
            />
          </Field>
          <Field label="Room">
            <select value={form.roomId} onChange={(event) => update('roomId', event.target.value)} required>
              <option value="">Select a room</option>
              {rooms.map((room) => {
                const full = room.occupiedBeds >= room.capacity
                const unavailable = full || room.status === 'MAINTENANCE'
                return (
                  <option key={room.id} value={room.id} disabled={unavailable}>
                    {room.roomNumber} · {room.occupiedBeds}/{room.capacity} beds
                    {room.status === 'MAINTENANCE' ? ' · maintenance' : full ? ' · full' : ''}
                  </option>
                )
              })}
            </select>
          </Field>
          <Field label="Move-in date">
            <input
              type="date"
              value={form.moveInDate}
              max={todayIso()}
              onChange={(event) => update('moveInDate', event.target.value)}
              required
            />
          </Field>
          <div className="field-span">
            <button type="submit" className="button button-primary" disabled={busy}>
              {busy ? 'Creating…' : 'Create tenant'}
            </button>
          </div>
        </form>
      </Card>

      <Card
        title="Tenant assignments"
        subtitle={`${activeCount} active of ${tenants.length} assignment${tenants.length === 1 ? '' : 's'}`}
      >
        {loading ? (
          <Loading label="Loading tenants…" />
        ) : tenants.length === 0 ? (
          <EmptyState title="No tenants yet" description="Create a tenant and assign a room." />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tenant</th>
                  <th>Room</th>
                  <th>Move-in</th>
                  <th>Monthly rent</th>
                  <th>Status</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {tenants.map((tenant) => (
                  <tr key={tenant.assignmentId}>
                    <td>
                      <div className="cell-title">{tenant.fullName}</div>
                      <div className="cell-sub">{tenant.email}</div>
                    </td>
                    <td>{tenant.roomNumber}</td>
                    <td>{date(tenant.moveInDate)}</td>
                    <td>{money(tenant.monthlyRent)}</td>
                    <td>
                      <StatusBadge status={tenant.status} />
                      {tenant.status === 'ENDED' && tenant.moveOutDate && (
                        <div className="cell-sub">out {date(tenant.moveOutDate)}</div>
                      )}
                    </td>
                    <td className="cell-actions">
                      {tenant.status === 'ACTIVE' && (
                        <button
                          type="button"
                          className="button button-small button-ghost"
                          onClick={() => endAssignment(tenant)}
                          disabled={endingId === tenant.assignmentId}
                        >
                          {endingId === tenant.assignmentId ? 'Ending…' : 'End assignment'}
                        </button>
                      )}
                    </td>
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
