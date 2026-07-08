import { useState } from 'react'
import Modal from './Modal'
import { api } from '../api/client'

function SoftwareLibraryItemModal({ item, onClose, onSaved }) {
  const isEdit = Boolean(item)
  const [softwareName, setSoftwareName] = useState(item?.software_name || '')
  const [version, setVersion] = useState(item?.version || '')
  const [eolDate, setEolDate] = useState(item?.eol_date || '')
  const [eosDate, setEosDate] = useState(item?.eos_date || '')
  const [notes, setNotes] = useState(item?.notes || '')
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const payload = {
        software_name: softwareName,
        version: version || null,
        eol_date: eolDate || null,
        eos_date: eosDate || null,
        notes: notes || null,
      }
      const saved = isEdit ? await api.updateSoftwareLibraryItem(item.id, payload) : await api.createSoftwareLibraryItem(payload)
      onSaved(saved)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={isEdit ? 'Edit software' : 'Add new software'} onClose={onClose} width={480}>
      <form onSubmit={handleSubmit} className="form">
        {error && <div className="form-error">{error}</div>}

        <label className="field">
          <span>Software name</span>
          <input value={softwareName} onChange={(e) => setSoftwareName(e.target.value)} required />
        </label>

        <label className="field">
          <span>Version</span>
          <input value={version} onChange={(e) => setVersion(e.target.value)} />
        </label>

        <div className="field-row">
          <label className="field">
            <span>EOL date</span>
            <input type="date" value={eolDate} onChange={(e) => setEolDate(e.target.value)} />
          </label>
          <label className="field">
            <span>EOS date</span>
            <input type="date" value={eosDate} onChange={(e) => setEosDate(e.target.value)} />
          </label>
        </div>

        <label className="field">
          <span>Notes</span>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
        </label>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Add software'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default SoftwareLibraryItemModal
