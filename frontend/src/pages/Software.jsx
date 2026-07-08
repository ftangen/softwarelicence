import { useEffect, useState } from 'react'
import { api } from '../api/client'
import SoftwareGroupRow from '../components/SoftwareGroupRow'
import EditEntryModal from '../components/EditEntryModal'
import ConfirmDialog from '../components/ConfirmDialog'
import './Software.css'

function Software() {
  const [groups, setGroups] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingEntry, setEditingEntry] = useState(null)
  const [deletingEntry, setDeletingEntry] = useState(null)
  const [deleteError, setDeleteError] = useState(null)
  const [deleting, setDeleting] = useState(false)

  function load() {
    setLoading(true)
    api
      .getSoftware({ search })
      .then((data) => {
        setGroups(data)
        setError(null)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [search])

  function handleEntryUpdated() {
    setEditingEntry(null)
    load()
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
      load()
    } catch (err) {
      setDeleteError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <h1>Software</h1>

      <div className="toolbar">
        <input
          type="search"
          placeholder="Search software, customer, project number/name, version..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="software-list">
        {groups.map((group) => (
          <SoftwareGroupRow key={group.software_name} group={group} onEdit={setEditingEntry} onDelete={setDeletingEntry} />
        ))}
      </div>

      {!loading && groups.length === 0 && <div className="empty-state">No software registered yet.</div>}

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

export default Software
