import { useEffect, useState } from 'react'
import { api } from '../api/client'
import StatusBadge from '../components/StatusBadge'
import SoftwareLibraryItemModal from '../components/SoftwareLibraryItemModal'
import ConfirmDialog from '../components/ConfirmDialog'

function SoftwareLibrary() {
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [deletingItem, setDeletingItem] = useState(null)
  const [deleteError, setDeleteError] = useState(null)
  const [deleting, setDeleting] = useState(false)

  function load() {
    setLoading(true)
    api
      .getSoftwareLibrary({ search })
      .then((data) => {
        setItems(data)
        setError(null)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [search])

  function handleSaved() {
    setShowAdd(false)
    setEditingItem(null)
    load()
  }

  function closeDeleteDialog() {
    setDeletingItem(null)
    setDeleteError(null)
  }

  async function handleConfirmDelete() {
    setDeleting(true)
    setDeleteError(null)
    try {
      await api.deleteSoftwareLibraryItem(deletingItem.id)
      setDeletingItem(null)
      load()
    } catch (err) {
      setDeleteError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Software Library</h1>
        <button type="button" className="btn-primary" onClick={() => setShowAdd(true)}>
          New software
        </button>
      </div>

      <div className="toolbar">
        <input
          type="search"
          placeholder="Search software or version..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <div className="form-error">{error}</div>}

      <table className="data-table">
        <thead>
          <tr>
            <th>Software name</th>
            <th>Version</th>
            <th>EOL date</th>
            <th>EOS date</th>
            <th>Status</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.software_name}</td>
              <td>{item.version || '—'}</td>
              <td>{item.eol_date || '—'}</td>
              <td>{item.eos_date || '—'}</td>
              <td>
                <StatusBadge status={item.status} />
              </td>
              <td>{item.notes || '—'}</td>
              <td>
                <div className="row-actions">
                  <button type="button" className="link-btn" onClick={() => setEditingItem(item)}>
                    Edit
                  </button>
                  <button type="button" className="link-btn danger" onClick={() => setDeletingItem(item)}>
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {!loading && items.length === 0 && (
        <div className="empty-state">
          No software in the library yet. Add common software (e.g. Windows Server versions) once, then reuse it
          when registering entries for customers.
        </div>
      )}

      {showAdd && <SoftwareLibraryItemModal onClose={() => setShowAdd(false)} onSaved={handleSaved} />}

      {editingItem && (
        <SoftwareLibraryItemModal item={editingItem} onClose={() => setEditingItem(null)} onSaved={handleSaved} />
      )}

      {deletingItem && (
        <ConfirmDialog
          title="Delete software"
          message={`Delete "${deletingItem.software_name}"${deletingItem.version ? ` (${deletingItem.version})` : ''} from the library? Software already registered to customers is not affected.`}
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

export default SoftwareLibrary
