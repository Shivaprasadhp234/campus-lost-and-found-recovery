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
import { money } from '../../utils/format'

const BLANK = { roomNumber: '', capacity: '2', monthlyRent: '' }

export default function RoomsPanel({ propertyId }) {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [form, setForm] = useState(BLANK)
  const [editingId, setEditingId] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get(`/properties/${propertyId}/rooms`)
      setRooms(data)
    } catch (err) {
      setError(errorMessage(err, 'Could not load rooms.'))
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

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const payload = {
        roomNumber: form.roomNumber,
        capacity: Number(form.capacity),
        monthlyRent: Number(form.monthlyRent),
      }
      if (editingId) {
        await api.put(`/rooms/${editingId}`, payload)
        setNotice('Room updated.')
      } else {
        await api.post(`/properties/${propertyId}/rooms`, payload)
        setNotice('Room added.')
      }
      setForm(BLANK)
      setEditingId(null)
      await load()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  function startEdit(room) {
    setEditingId(room.id)
    setForm({
      roomNumber: room.roomNumber,
      capacity: String(room.capacity),
      monthlyRent: String(room.monthlyRent),
    })
    setError('')
    setNotice('')
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(BLANK)
  }

  async function changeStatus(room, status) {
    setError('')
    setNotice('')
    try {
      await api.patch(`/rooms/${room.id}/status`, { status })
      setNotice(`Room ${room.roomNumber} marked ${status.toLowerCase()}.`)
      await load()
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  return (
    <div className="stack-lg">
      <Card
        title={editingId ? 'Edit room' : 'Add a room'}
        subtitle="Set capacity and monthly rent."
      >
        <ErrorNotice message={error} onRetry={load} />
        <SuccessNotice message={notice} />
        <form className="form-grid" onSubmit={submit}>
          <Field label="Room number">
            <input
              value={form.roomNumber}
              onChange={(event) => update('roomNumber', event.target.value)}
              placeholder="101"
              maxLength={30}
              required
            />
          </Field>
          <Field label="Capacity (beds)">
            <input
              type="number"
              min="1"
              max="50"
              value={form.capacity}
              onChange={(event) => update('capacity', event.target.value)}
              required
            />
          </Field>
          <Field label="Monthly rent (₹)">
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.monthlyRent}
              onChange={(event) => update('monthlyRent', event.target.value)}
              placeholder="6500"
              required
            />
          </Field>
          <div className="field-span button-row">
            <button type="submit" className="button button-primary" disabled={busy}>
              {busy ? 'Saving…' : editingId ? 'Save room' : 'Add room'}
            </button>
            {editingId && (
              <button type="button" className="button button-ghost" onClick={cancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </Card>

      <Card title="Rooms" subtitle={`${rooms.length} room${rooms.length === 1 ? '' : 's'} on this property`}>
        {loading ? (
          <Loading label="Loading rooms…" />
        ) : rooms.length === 0 ? (
          <EmptyState title="No rooms yet" description="Add a room to start assigning tenants." />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Room</th>
                  <th>Beds</th>
                  <th>Occupied</th>
                  <th>Monthly rent</th>
                  <th>Status</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr key={room.id}>
                    <td className="cell-title">{room.roomNumber}</td>
                    <td>{room.capacity}</td>
                    <td>
                      {room.occupiedBeds} / {room.capacity}
                    </td>
                    <td>{money(room.monthlyRent)}</td>
                    <td>
                      <StatusBadge status={room.status} />
                    </td>
                    <td className="cell-actions">
                      <button
                        type="button"
                        className="button button-small button-ghost"
                        onClick={() => startEdit(room)}
                      >
                        Edit
                      </button>
                      {room.status === 'MAINTENANCE' ? (
                        <button
                          type="button"
                          className="button button-small button-ghost"
                          onClick={() => changeStatus(room, 'AVAILABLE')}
                        >
                          Mark available
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="button button-small button-ghost"
                          onClick={() => changeStatus(room, 'MAINTENANCE')}
                        >
                          Set maintenance
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
