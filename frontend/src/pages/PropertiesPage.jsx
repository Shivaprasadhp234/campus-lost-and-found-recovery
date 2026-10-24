import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, errorMessage } from '../api/client'
import {
  Card,
  EmptyState,
  ErrorNotice,
  Field,
  Loading,
  PageHeader,
  StatusBadge,
  SuccessNotice,
} from '../components/ui'

const BLANK_FORM = { name: '', address: '' }

export default function PropertiesPage() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [form, setForm] = useState(BLANK_FORM)
  const [busy, setBusy] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', address: '', active: true })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/properties')
      setProperties(data)
    } catch (err) {
      setError(errorMessage(err, 'Could not load properties.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function createProperty(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await api.post('/properties', { name: form.name, address: form.address })
      setForm(BLANK_FORM)
      setNotice('Property created.')
      await load()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  function startEdit(property) {
    setEditingId(property.id)
    setEditForm({ name: property.name, address: property.address, active: property.active })
    setNotice('')
    setError('')
  }

  async function saveEdit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await api.put(`/properties/${editingId}`, editForm)
      setEditingId(null)
      setNotice('Property updated.')
      await load()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Owner workspace"
        title="Properties"
        subtitle="Create and manage the properties you own."
      />

      <ErrorNotice message={error} onRetry={load} />
      <SuccessNotice message={notice} />

      <div className="properties-layout">
        <Card
          title="Your properties"
          subtitle={`${properties.length} propert${properties.length === 1 ? 'y' : 'ies'}`}
          className="properties-main"
        >
          {loading ? (
            <Loading label="Loading properties…" />
          ) : properties.length === 0 ? (
            <EmptyState title="No properties yet" description="Add your first property using the form." />
          ) : (
            <div className="property-grid">
              {properties.map((property) => (
                <article key={property.id} className="property-card">
                  <div className="property-card-head">
                    <div>
                      <h3>{property.name}</h3>
                      <p className="muted">{property.address}</p>
                    </div>
                    <StatusBadge status={property.active ? 'ACTIVE' : 'ENDED'} />
                  </div>

                  <div className="property-counts">
                    <div>
                      <strong>{property.roomCount}</strong>
                      <span>Rooms</span>
                    </div>
                    <div>
                      <strong>{property.activeTenants}</strong>
                      <span>Active tenants</span>
                    </div>
                  </div>

                  {editingId === property.id ? (
                    <form className="stack" onSubmit={saveEdit}>
                      <Field label="Name">
                        <input
                          value={editForm.name}
                          onChange={(event) => setEditForm({ ...editForm, name: event.target.value })}
                          maxLength={120}
                          required
                        />
                      </Field>
                      <Field label="Address">
                        <textarea
                          value={editForm.address}
                          onChange={(event) => setEditForm({ ...editForm, address: event.target.value })}
                          rows={2}
                          maxLength={255}
                          required
                        />
                      </Field>
                      <label className="checkbox-row">
                        <input
                          type="checkbox"
                          checked={editForm.active}
                          onChange={(event) => setEditForm({ ...editForm, active: event.target.checked })}
                        />
                        Active
                      </label>
                      <div className="button-row">
                        <button type="submit" className="button button-primary button-small" disabled={busy}>
                          Save
                        </button>
                        <button
                          type="button"
                          className="button button-ghost button-small"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="button-row">
                      <Link className="button button-primary button-small" to={`/owner/properties/${property.id}`}>
                        Open
                      </Link>
                      <button
                        type="button"
                        className="button button-ghost button-small"
                        onClick={() => startEdit(property)}
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </Card>

        <Card title="Add a property" className="properties-aside">
          <form className="stack" onSubmit={createProperty}>
            <Field label="Property name">
              <input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="Sunrise PG"
                maxLength={120}
                required
              />
            </Field>
            <Field label="Address">
              <textarea
                value={form.address}
                onChange={(event) => setForm({ ...form, address: event.target.value })}
                placeholder="12 MG Road, Bengaluru"
                rows={3}
                maxLength={255}
                required
              />
            </Field>
            <button type="submit" className="button button-primary" disabled={busy}>
              {busy ? 'Creating…' : 'Create property'}
            </button>
          </form>
        </Card>
      </div>
    </>
  )
}
