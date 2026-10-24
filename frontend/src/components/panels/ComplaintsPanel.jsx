import { useCallback, useEffect, useState } from 'react'
import { api, errorMessage } from '../../api/client'
import {
  Card,
  EmptyState,
  ErrorNotice,
  Loading,
  StatusBadge,
  SuccessNotice,
} from '../ui'
import { dateTime } from '../../utils/format'

const STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']

export default function ComplaintsPanel({ propertyId }) {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get(`/properties/${propertyId}/complaints`)
      setComplaints(data)
    } catch (err) {
      setError(errorMessage(err, 'Could not load complaints.'))
    } finally {
      setLoading(false)
    }
  }, [propertyId])

  useEffect(() => {
    load()
  }, [load])

  async function changeStatus(complaint, status) {
    setUpdatingId(complaint.id)
    setError('')
    setNotice('')
    try {
      const { data } = await api.patch(`/complaints/${complaint.id}/status`, { status })
      setComplaints((current) =>
        current.map((item) => (item.id === complaint.id ? data : item)),
      )
      setNotice(`Complaint #${complaint.id} updated to ${status.replaceAll('_', ' ').toLowerCase()}.`)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setUpdatingId(null)
    }
  }

  const openCount = complaints.filter(
    (complaint) => complaint.status === 'OPEN' || complaint.status === 'IN_PROGRESS',
  ).length

  return (
    <div className="stack-lg">
      <ErrorNotice message={error} onRetry={load} />
      <SuccessNotice message={notice} />

      <Card
        title="Complaints"
        subtitle={`${openCount} open or in progress of ${complaints.length} total`}
        actions={
          <button type="button" className="button button-small button-ghost" onClick={load}>
            Refresh
          </button>
        }
      >
        {loading ? (
          <Loading label="Loading complaints…" />
        ) : complaints.length === 0 ? (
          <EmptyState
            title="No complaints yet"
            description="Complaints raised by tenants on this property will appear here."
          />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tenant / room</th>
                  <th>Complaint</th>
                  <th>Raised</th>
                  <th>Status</th>
                  <th>Resolved by</th>
                  <th>Update status</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((complaint) => (
                  <tr key={complaint.id}>
                    <td>
                      <div className="cell-title">{complaint.tenantName}</div>
                      <div className="cell-sub">
                        {complaint.roomNumber ? `Room ${complaint.roomNumber}` : complaint.propertyName}
                      </div>
                    </td>
                    <td className="cell-wide">
                      <div className="cell-title">{complaint.title}</div>
                      <div className="cell-sub">{complaint.description}</div>
                    </td>
                    <td>{dateTime(complaint.createdAt)}</td>
                    <td>
                      <StatusBadge status={complaint.status} />
                    </td>
                    <td>{complaint.resolvedByName || '—'}</td>
                    <td>
                      <select
                        value={complaint.status}
                        onChange={(event) => changeStatus(complaint, event.target.value)}
                        disabled={updatingId === complaint.id}
                        aria-label={`Update status for complaint ${complaint.id}`}
                      >
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status.replaceAll('_', ' ')}
                          </option>
                        ))}
                      </select>
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
