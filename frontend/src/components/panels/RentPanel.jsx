import { useCallback, useEffect, useState } from 'react'
import { api, errorMessage } from '../../api/client'
import {
  Card,
  EmptyState,
  ErrorNotice,
  Field,
  InfoNotice,
  Loading,
  StatusBadge,
  SuccessNotice,
} from '../ui'
import { date, money, todayIso } from '../../utils/format'

function blankForm() {
  return {
    tenantUserId: '',
    amount: '',
    dueDate: todayIso(),
    paymentMethod: 'CASH',
    referenceNote: '',
  }
}

export default function RentPanel({ propertyId }) {
  const [records, setRecords] = useState([])
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [form, setForm] = useState(blankForm)
  const [busy, setBusy] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [rentResponse, tenantResponse] = await Promise.all([
        api.get(`/properties/${propertyId}/rent-records`),
        api.get(`/properties/${propertyId}/tenants`),
      ])
      setRecords(rentResponse.data)
      setTenants(tenantResponse.data)
    } catch (err) {
      setError(errorMessage(err, 'Could not load rent records.'))
    } finally {
      setLoading(false)
    }
  }, [propertyId])

  useEffect(() => {
    load()
  }, [load])

  const activeTenants = tenants.filter((tenant) => tenant.status === 'ACTIVE')

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function addRecord(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await api.post(`/properties/${propertyId}/rent-records`, {
        tenantUserId: Number(form.tenantUserId),
        amount: Number(form.amount),
        dueDate: form.dueDate,
        paymentMethod: form.paymentMethod || null,
        referenceNote: form.referenceNote || null,
      })
      setForm((current) => ({ ...current, amount: '', referenceNote: '' }))
      setNotice('Rent record added.')
      await load()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  async function changeStatus(record, status) {
    setUpdatingId(record.id)
    setError('')
    setNotice('')
    try {
      const payload = {
        status,
        paidDate: status === 'PAID' ? todayIso() : null,
        paymentMethod: record.paymentMethod,
        referenceNote: record.referenceNote,
      }
      await api.patch(`/rent-records/${record.id}`, payload)
      setNotice(status === 'PAID' ? 'Rent record marked paid.' : 'Rent record marked pending.')
      await load()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="stack-lg">
      <Card title="Record rent" subtitle="Track payments for active tenants.">
        <ErrorNotice message={error} onRetry={load} />
        <SuccessNotice message={notice} />
        {activeTenants.length === 0 ? (
          <InfoNotice>Add an active tenant first.</InfoNotice>
        ) : (
          <form className="form-grid" onSubmit={addRecord}>
            <Field label="Tenant">
              <select
                value={form.tenantUserId}
                onChange={(event) => update('tenantUserId', event.target.value)}
                required
              >
                <option value="">Select a tenant</option>
                {activeTenants.map((tenant) => (
                  <option key={tenant.tenantUserId} value={tenant.tenantUserId}>
                    {tenant.fullName} · Room {tenant.roomNumber}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Amount (₹)">
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={(event) => update('amount', event.target.value)}
                placeholder="6500"
                required
              />
            </Field>
            <Field label="Due date">
              <input
                type="date"
                value={form.dueDate}
                onChange={(event) => update('dueDate', event.target.value)}
                required
              />
            </Field>
            <Field label="Payment method">
              <select
                value={form.paymentMethod}
                onChange={(event) => update('paymentMethod', event.target.value)}
              >
                <option value="CASH">Cash</option>
                <option value="BANK_TRANSFER">Bank transfer</option>
                <option value="UPI">UPI</option>
                <option value="OTHER">Other</option>
              </select>
            </Field>
            <Field label="Reference / note" hint="Optional.">
              <input
                value={form.referenceNote}
                onChange={(event) => update('referenceNote', event.target.value)}
                maxLength={255}
                placeholder="Receipt 0142"
              />
            </Field>
            <div className="field-span">
              <button type="submit" className="button button-primary" disabled={busy}>
                {busy ? 'Saving…' : 'Add rent record'}
              </button>
            </div>
          </form>
        )}
      </Card>

      <Card title="Rent records" subtitle={`${records.length} record${records.length === 1 ? '' : 's'}`}>
        {loading ? (
          <Loading label="Loading rent records…" />
        ) : records.length === 0 ? (
          <EmptyState title="No rent records yet" description="Recorded rent will appear here." />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tenant</th>
                  <th>Room</th>
                  <th>Amount</th>
                  <th>Due</th>
                  <th>Paid</th>
                  <th>Status</th>
                  <th>Method / note</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id}>
                    <td className="cell-title">{record.tenantName}</td>
                    <td>{record.roomNumber || '—'}</td>
                    <td>{money(record.amount)}</td>
                    <td>{date(record.dueDate)}</td>
                    <td>{date(record.paidDate)}</td>
                    <td>
                      <StatusBadge status={record.effectiveStatus} />
                    </td>
                    <td>
                      <div>{record.paymentMethod || '—'}</div>
                      {record.referenceNote && <div className="cell-sub">{record.referenceNote}</div>}
                    </td>
                    <td className="cell-actions">
                      {record.status === 'PAID' ? (
                        <button
                          type="button"
                          className="button button-small button-ghost"
                          onClick={() => changeStatus(record, 'PENDING')}
                          disabled={updatingId === record.id}
                        >
                          Mark pending
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="button button-small button-primary"
                          onClick={() => changeStatus(record, 'PAID')}
                          disabled={updatingId === record.id}
                        >
                          {updatingId === record.id ? 'Saving…' : 'Mark paid'}
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
