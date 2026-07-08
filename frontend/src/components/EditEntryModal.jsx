import { useState } from 'react'
import Modal from './Modal'
import { api } from '../api/client'

const LICENSE_TYPES = ['Perpetual', 'Subscription', 'Volume', 'Support']

function EditEntryModal({ entry, onClose, onSaved }) {
  const [softwareName, setSoftwareName] = useState(entry.software_name)
  const [version, setVersion] = useState(entry.version || '')
  const [eolDate, setEolDate] = useState(entry.eol_date || '')
  const [eosDate, setEosDate] = useState(entry.eos_date || '')
  const [licenseType, setLicenseType] = useState(entry.license_type)
  const [notes, setNotes] = useState(entry.notes || '')
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await api.updateSoftwareEntry(entry.id, {
        software_name: softwareName,
        version: version || null,
        eol_date: eolDate || null,
        eos_date: eosDate || null,
        license_type: licenseType,
        notes: notes || null,
      })
      onSaved()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title="Edit entry" onClose={onClose} width={480}>
      <form onSubmit={handleSubmit} className="form">
        {error && <div className="form-error">{error}</div>}

        <div className="entry-context">
          {entry.customer_name} — {entry.project_number} {entry.project_name}
        </div>

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
          <span>License type</span>
          <select value={licenseType} onChange={(e) => setLicenseType(e.target.value)}>
            {LICENSE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Notes</span>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
        </label>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default EditEntryModal
