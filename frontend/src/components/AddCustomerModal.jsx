import { useState } from 'react'
import Modal from './Modal'
import { api } from '../api/client'

const ENV_OPTIONS = ['IT', 'OT']

function AddCustomerModal({ onClose, onCreated }) {
  const [name, setName] = useState('')
  const [environmentTypes, setEnvironmentTypes] = useState([])
  const [notes, setNotes] = useState('')
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  function toggleEnv(type) {
    setEnvironmentTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (environmentTypes.length === 0) {
      setError('Select at least one environment type')
      return
    }

    setSaving(true)
    try {
      const customer = await api.createCustomer({
        name,
        environment_types: environmentTypes,
        notes: notes || null,
      })
      onCreated(customer)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title="New customer" onClose={onClose}>
      <form onSubmit={handleSubmit} className="form">
        {error && <div className="form-error">{error}</div>}

        <label className="field">
          <span>Customer name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>

        <fieldset className="field">
          <span>Environment type</span>
          <div className="checkbox-row">
            {ENV_OPTIONS.map((type) => (
              <label key={type} className="checkbox">
                <input
                  type="checkbox"
                  checked={environmentTypes.includes(type)}
                  onChange={() => toggleEnv(type)}
                />
                {type}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="field">
          <span>Notes</span>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
        </label>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Create customer'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default AddCustomerModal
