import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, errorMessage } from '../api/client'
import {
  Card,
  EmptyState,
  ErrorNotice,
  Loading,
  PageHeader,
  StatCard,
} from './ui'
import { money } from '../utils/format'

export default function DashboardView({ endpoint, eyebrow, title, subtitle, propertyBase }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await api.get(endpoint)
      setData(response.data)
    } catch (err) {
      setError(errorMessage(err, 'Could not load the dashboard.'))
    } finally {
      setLoading(false)
    }
  }, [endpoint])

  useEffect(() => {
    load()
  }, [load])

  return (
    <>
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
        actions={
          <button type="button" className="button button-ghost" onClick={load} disabled={loading}>
            Refresh
          </button>
        }
      />

      <ErrorNotice message={error} onRetry={load} />

      {loading && !data ? (
        <Loading label="Loading dashboard…" />
      ) : data ? (
        <>
          <div className="stat-grid">
            <StatCard label="Properties" value={data.totalProperties} hint="In your scope" />
            <StatCard label="Rooms" value={data.totalRooms} hint={`${data.occupiedRooms} occupied`} />
            <StatCard label="Active tenants" value={data.activeTenants} hint="Current assignments" />
            <StatCard
              label="Rent due"
              value={money(data.pendingRentTotal)}
              hint="Pending and overdue"
              tone="warning"
            />
            <StatCard
              label="Overdue"
              value={money(data.overdueRentTotal)}
              hint="Past the due date"
              tone="danger"
            />
            <StatCard
              label="Open complaints"
              value={data.openComplaints}
              hint="Open or in progress"
              tone="info"
            />
          </div>

          <Card title="Properties" subtitle="Occupancy, rent and complaints by property.">
            {data.properties.length === 0 ? (
              <EmptyState
                title="No properties yet"
                description="Create a property to start adding rooms and tenants."
              />
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Property</th>
                      <th>Rooms</th>
                      <th>Occupied</th>
                      <th>Tenants</th>
                      <th>Rent due</th>
                      <th>Overdue</th>
                      <th>Complaints</th>
                      <th aria-label="Open" />
                    </tr>
                  </thead>
                  <tbody>
                    {data.properties.map((property) => (
                      <tr key={property.propertyId}>
                        <td>
                          <div className="cell-title">{property.propertyName}</div>
                        </td>
                        <td>{property.totalRooms}</td>
                        <td>{property.occupiedRooms}</td>
                        <td>{property.activeTenants}</td>
                        <td>{money(property.pendingRentTotal)}</td>
                        <td className={Number(property.overdueRentTotal) > 0 ? 'text-danger' : ''}>
                          {money(property.overdueRentTotal)}
                        </td>
                        <td>{property.openComplaints}</td>
                        <td className="cell-actions">
                          <Link
                            className="button button-small button-ghost"
                            to={`${propertyBase}/${property.propertyId}`}
                          >
                            Open
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      ) : null}
    </>
  )
}
