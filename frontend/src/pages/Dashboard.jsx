import { useCallback, useEffect, useState } from 'react'
import { api } from '../api/client'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import AddEntryModal from '../components/AddEntryModal'
import EditEntryModal from '../components/EditEntryModal'
import ConfirmDialog from '../components/ConfirmDialog'

const STATUS_OPTIONS = ['Critical', 'Approaching', 'OK', 'Unknown']

function Dashboard() {
  const [stats, setStats] = useState({ total: 0, critical: 0, approaching: 0, ok: 0, unknown: 0 })
  const [entries, setEntries] = useState([])
  const [customers, setCustomers] = useState([])
  const [search, setSearch] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddEntry, setShowAddEntry] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)
  const [deletingEntry, setDeletingEntry] = useState(null)
  const [deleteError, setDeleteError] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const loadDashboard = useCallback(() => {
    setLoading(true)
    api
      .getDashboard({ search, customer_id: customerId, status })
      .then((data) => {
        setStats(data.stats)
        setEntries(data.entries)
        setError(null)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [search, customerId, status])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  useEffect(() => {
    api.getCustomers().then(setCustomers).catch(() => {})
  }, [])

  function handleEntryCreated() {
    setShowAddEntry(false)
    loadDashboard()
  }

  function handleEntryUpdated() {
    setEditingEntry(null)
    loadDashboard()
  }

  function closeDeleteDialog() {
    setDeletingEntry(null)
    setDeleteError(null)
  }

  async function handleConfirmDelete() {
    setDeleting(true)
    setDeleteError(null)
    try {
      await api.deleteSoftwareEntry(deletingEntry.id)
      setDeletingEntry(null)
      loadDashboard()
    } catch (err) {
      setDeleteError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <div className="stat-grid">
        <StatCard label="Total registered" value={stats.total} />
        <StatCard label="Critical" value={stats.critical} tone="critical" />
        <StatCard label="Approaching" value={stats.approaching} tone="approaching" />
        <StatCard label="OK" value={stats.ok} tone="ok" />
      </div>

      <div className="toolbar">
        <input
          type="search"
          placeholder="Search customer or software..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
          <option value="">All customers</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <div className="spacer" />
        <button type="button" className="btn-primary" onClick={() => setShowAddEntry(true)}>
          New entry
        </button>
      </div>

      {error && <div className="form-error">{error}</div>}

      <table className="data-table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Software</th>
            <th>Version</th>
            <th>EOL date</th>
            <th>EOS date</th>
            <th>License type</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td>{entry.customer_name}</td>
              <td>{entry.software_name}</td>
              <td>{entry.version || '—'}</td>
              <td>{entry.eol_date || '—'}</td>
              <td>{entry.eos_date || '—'}</td>
              <td>{entry.license_type}</td>
              <td>
                <StatusBadge status={entry.status} />
              </td>
              <td>
                <div className="row-actions">
                  <button type="button" className="link-btn" onClick={() => setEditingEntry(entry)}>
                    Edit
                  </button>
                  <button type="button" className="link-btn danger" onClick={() => setDeletingEntry(entry)}>
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {!loading && entries.length === 0 && <div className="empty-state">No entries match your filters.</div>}

      {showAddEntry && <AddEntryModal onClose={() => setShowAddEntry(false)} onCreated={handleEntryCreated} />}

      {editingEntry && (
        <EditEntryModal entry={editingEntry} onClose={() => setEditingEntry(null)} onSaved={handleEntryUpdated} />
      )}

      {deletingEntry && (
        <ConfirmDialog
          title="Delete software entry"
          message={`Delete "${deletingEntry.software_name}" for ${deletingEntry.customer_name}? This cannot be undone.`}
          confirmLabel="Delete"
          busy={deleting}
          error={deleteError}
          onCancel={closeDeleteDialog}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  )
}

export default Dashboard
