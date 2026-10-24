import { useCallback, useEffect, useState } from 'react'
import { api, errorMessage } from '../api/client'
import {
  Card,
  EmptyState,
  ErrorNotice,
  Field,
  InfoNotice,
  Loading,
  PageHeader,
  StatCard,
  StatusBadge,
  SuccessNotice,
} from '../components/ui'
import { date, dateTime, money } from '../utils/format'

const BLANK = { title: '', description: '' }

export default function TenantDashboardPage() {
  const [dashboard, setDashboard] = useState(null)
  const [rents, setRents] = useState([])
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [form, setForm] = useState(BLANK)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [dashboardResponse, rentResponse, complaintResponse] = await Promise.all([
        api.get('/tenant/dashboard'),
        api.get('/tenant/me/rent-records'),
        api.get('/tenant/me/complaints'),
      ])
      setDashboard(dashboardResponse.data)
      setRents(rentResponse.data)
      setComplaints(complaintResponse.data)
    } catch (err) {
      setError(errorMessage(err, 'Could not load your dashboard.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function createComplaint(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await api.post('/tenant/me/complaints', form)
      setForm(BLANK)
      setNotice('Complaint submitted.')
      await load()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const profile = dashboard?.profile
  const assignment = profile?.assignment

  return (
    <>
      <PageHeader
        eyebrow="Tenant workspace"
        title={`Hello, ${profile?.fullName || 'tenant'}`}
        subtitle="Your room, rent and complaints."
        actions={
          <button type="button" className="button button-ghost" onClick={load} disabled={loading}>
            Refresh
          </button>
        }
      />

      <ErrorNotice message={error} onRetry={load} />
      <SuccessNotice message={notice} />

      {loading && !dashboard ? (
        <Loading label="Loading your details…" />
      ) : dashboard ? (
        <>
          {!assignment && (
            <InfoNotice>
              No active room assignment. Contact your property manager if this is unexpected.
            </InfoNotice>
          )}

          <div className="stat-grid">
            <StatCard
              label="Rent due"
              value={money(dashboard.pendingRentTotal)}
              hint="Pending + overdue"
              tone="warning"
            />
            <StatCard
              label="Overdue"
              value={money(dashboard.overdueRentTotal)}
              hint="Past the due date"
              tone="danger"
            />
            <StatCard
              label="Open complaints"
              value={dashboard.openComplaints}
              hint="Open or in progress"
              tone="info"
            />
            <StatCard
              label="Monthly rent"
              value={assignment ? money(assignment.monthlyRent) : '—'}
              hint={assignment ? `Room ${assignment.roomNumber}` : 'No active room'}
            />
          </div>

          <div className="split-grid">
            <Card title="My profile">
              <dl className="detail-list">
                <div>
                  <dt>Name</dt>
                  <dd>{profile.fullName}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{profile.email}</dd>
                </div>
                <div>
                  <dt>Property</dt>
                  <dd>{assignment?.propertyName || '—'}</dd>
                </div>
                <div>
                  <dt>Address</dt>
                  <dd>{assignment?.propertyAddress || '—'}</dd>
                </div>
                <div>
                  <dt>Room</dt>
                  <dd>{assignment?.roomNumber || '—'}</dd>
                </div>
                <div>
                  <dt>Move-in date</dt>
                  <dd>{assignment ? date(assignment.moveInDate) : '—'}</dd>
                </div>
              </dl>
            </Card>

            <Card title="Raise a complaint" subtitle="Sent to your property manager.">
              <form className="stack" onSubmit={createComplaint}>
                <Field label="Title">
                  <input
                    value={form.title}
                    onChange={(event) => setForm({ ...form, title: event.target.value })}
                    maxLength={150}
                    placeholder="Water leak in the bathroom"
                    required
                  />
                </Field>
                <Field label="Description">
                  <textarea
                    value={form.description}
                    onChange={(event) => setForm({ ...form, description: event.target.value })}
                    rows={4}
                    maxLength={1000}
                    placeholder="Describe the problem and when it started."
                    required
                  />
                </Field>
                <button type="submit" className="button button-primary" disabled={busy}>
                  {busy ? 'Submitting…' : 'Submit complaint'}
                </button>
              </form>
            </Card>
          </div>

          <Card title="My rent history" subtitle="Recorded by management.">
            {rents.length === 0 ? (
              <EmptyState title="No rent records yet" description="No rent has been recorded for you yet." />
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Amount</th>
                      <th>Due date</th>
                      <th>Paid date</th>
                      <th>Status</th>
                      <th>Method / note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rents.map((rent) => (
                      <tr key={rent.id}>
                        <td className="cell-title">{money(rent.amount)}</td>
                        <td>{date(rent.dueDate)}</td>
                        <td>{date(rent.paidDate)}</td>
                        <td>
                          <StatusBadge status={rent.effectiveStatus} />
                        </td>
                        <td>
                          <div>{rent.paymentMethod || '—'}</div>
                          {rent.referenceNote && <div className="cell-sub">{rent.referenceNote}</div>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card title="My complaints" subtitle={`${complaints.length} complaint${complaints.length === 1 ? '' : 's'}`}>
            {complaints.length === 0 ? (
              <EmptyState title="No complaints" description="Nothing has been raised." />
            ) : (
              <div className="complaint-list">
                {complaints.map((complaint) => (
                  <article key={complaint.id} className="complaint-item">
                    <div className="complaint-head">
                      <div>
                        <h3>{complaint.title}</h3>
                        <p className="muted">
                          Raised {dateTime(complaint.createdAt)}
                          {complaint.roomNumber ? ` · Room ${complaint.roomNumber}` : ''}
                        </p>
                      </div>
                      <StatusBadge status={complaint.status} />
                    </div>
                    <p>{complaint.description}</p>
                    {complaint.resolvedByName && (
                      <p className="muted">Handled by {complaint.resolvedByName}</p>
                    )}
                  </article>
                ))}
              </div>
            )}
          </Card>
        </>
      ) : null}
    </>
  )
}
