import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, errorMessage } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import {
  Card,
  ErrorNotice,
  Field,
  Loading,
  PageHeader,
  StatCard,
  StatusBadge,
  SuccessNotice,
  Tabs,
} from '../components/ui'
import ManagersPanel from '../components/panels/ManagersPanel'
import RoomsPanel from '../components/panels/RoomsPanel'
import TenantsPanel from '../components/panels/TenantsPanel'
import RentPanel from '../components/panels/RentPanel'
import ComplaintsPanel from '../components/panels/ComplaintsPanel'
import { money } from '../utils/format'

export default function PropertyDetailPage() {
  const { propertyId } = useParams()
  const { user } = useAuth()
  const isOwner = user.role === 'OWNER'

  const [property, setProperty] = useState(null)
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('overview')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [propertyResponse, dashboardResponse] = await Promise.all([
        api.get(`/properties/${propertyId}`),
        api.get(`/properties/${propertyId}/dashboard`),
      ])
      setProperty(propertyResponse.data)
      setDashboard(dashboardResponse.data)
    } catch (err) {
      setError(errorMessage(err, 'Could not load this property.'))
    } finally {
      setLoading(false)
    }
  }, [propertyId])

  useEffect(() => {
    load()
  }, [load])

  const tabs = [
    { id: 'overview', label: 'Overview' },
    ...(isOwner ? [{ id: 'managers', label: 'Managers' }] : []),
    { id: 'rooms', label: 'Rooms' },
    { id: 'tenants', label: 'Tenants' },
    { id: 'rent', label: 'Rent' },
    { id: 'complaints', label: 'Complaints' },
  ]

  const row = dashboard?.properties?.[0]

  return (
    <>
      <PageHeader
        eyebrow={isOwner ? 'Owner workspace' : 'Manager workspace'}
        title={property?.name || 'Property'}
        subtitle={property?.address}
        actions={
          <Link className="button button-ghost" to={isOwner ? '/owner/properties' : '/manager'}>
            ← Back
          </Link>
        }
      />

      <ErrorNotice message={error} onRetry={load} />

      {loading && !property ? (
        <Loading label="Loading property…" />
      ) : property ? (
        <>
          <div className="property-summary">
            <StatusBadge status={property.active ? 'ACTIVE' : 'ENDED'} />
            <span>{property.roomCount} rooms</span>
            <span>{property.activeTenants} active tenants</span>
          </div>

          <Tabs tabs={tabs} active={tab} onChange={setTab} />

          {tab === 'overview' && (
            <OverviewPanel
              property={property}
              row={row}
              isOwner={isOwner}
              onUpdated={load}
            />
          )}
          {tab === 'managers' && isOwner && <ManagersPanel propertyId={property.id} />}
          {tab === 'rooms' && <RoomsPanel propertyId={property.id} />}
          {tab === 'tenants' && <TenantsPanel propertyId={property.id} />}
          {tab === 'rent' && <RentPanel propertyId={property.id} />}
          {tab === 'complaints' && <ComplaintsPanel propertyId={property.id} />}
        </>
      ) : null}
    </>
  )
}

function OverviewPanel({ property, row, isOwner, onUpdated }) {
  const [form, setForm] = useState({
    name: property.name,
    address: property.address,
    active: property.active,
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    setForm({ name: property.name, address: property.address, active: property.active })
  }, [property])

  async function save(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await api.put(`/properties/${property.id}`, form)
      setNotice('Property details saved.')
      await onUpdated()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="stack-lg">
      <div className="stat-grid">
        <StatCard label="Rooms" value={row?.totalRooms ?? 0} hint={`${row?.occupiedRooms ?? 0} occupied`} />
        <StatCard label="Active tenants" value={row?.activeTenants ?? 0} hint="Current assignments" />
        <StatCard label="Rent due" value={money(row?.pendingRentTotal)} hint="Pending + overdue" tone="warning" />
        <StatCard label="Overdue" value={money(row?.overdueRentTotal)} hint="Past the due date" tone="danger" />
        <StatCard label="Open complaints" value={row?.openComplaints ?? 0} hint="Open or in progress" tone="info" />
      </div>

      {isOwner && (
        <Card title="Property details">
          <ErrorNotice message={error} />
          <SuccessNotice message={notice} />
          <form className="form-grid" onSubmit={save}>
            <Field label="Property name">
              <input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                maxLength={120}
                required
              />
            </Field>
            <Field label="Address">
              <input
                value={form.address}
                onChange={(event) => setForm({ ...form, address: event.target.value })}
                maxLength={255}
                required
              />
            </Field>
            <label className="checkbox-row field-span">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(event) => setForm({ ...form, active: event.target.checked })}
              />
              Active
            </label>
            <div className="field-span">
              <button type="submit" className="button button-primary" disabled={busy}>
                {busy ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        </Card>
      )}
    </div>
  )
}
