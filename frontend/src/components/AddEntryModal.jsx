import { useEffect, useState } from 'react'
import Modal from './Modal'
import AddCustomerModal from './AddCustomerModal'
import SoftwareLibraryItemModal from './SoftwareLibraryItemModal'
import { api } from '../api/client'

const LICENSE_TYPES = ['Perpetual', 'Subscription', 'Volume', 'Support']
const NEW_OPTION = '__new__'
const PROJECT_NUMBER_RE = /^\d{5}$/

function softwareLabel(item) {
  return item.version ? `${item.software_name} — ${item.version}` : item.software_name
}

function AddEntryModal({ onClose, onCreated }) {
  const [customers, setCustomers] = useState([])
  const [customerId, setCustomerId] = useState('')
  const [showAddCustomer, setShowAddCustomer] = useState(false)

  const [projects, setProjects] = useState([])
  const [projectId, setProjectId] = useState('')
  const [newProjectNumber, setNewProjectNumber] = useState('')
  const [newProjectName, setNewProjectName] = useState('')

  const [libraryItems, setLibraryItems] = useState([])
  const [softwareId, setSoftwareId] = useState('')
  const [showAddSoftware, setShowAddSoftware] = useState(false)

  const [eolDate, setEolDate] = useState('')
  const [eosDate, setEosDate] = useState('')
  const [licenseType, setLicenseType] = useState(LICENSE_TYPES[0])
  const [notes, setNotes] = useState('')

  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.getCustomers().then(setCustomers).catch((err) => setError(err.message))
    api.getSoftwareLibrary().then(setLibraryItems).catch((err) => setError(err.message))
  }, [])

  useEffect(() => {
    if (!customerId) {
      setProjects([])
      setProjectId('')
      return
    }
    api.getCustomerProjects(customerId).then(setProjects).catch((err) => setError(err.message))
    setProjectId('')
  }, [customerId])

  function handleCustomerChange(e) {
    const value = e.target.value
    if (value === NEW_OPTION) {
      setShowAddCustomer(true)
      return
    }
    setCustomerId(value)
  }

  function handleCustomerCreated(customer) {
    setCustomers((prev) => [...prev, customer])
    setCustomerId(String(customer.id))
    setShowAddCustomer(false)
  }

  function applySoftwareSelection(item) {
    setSoftwareId(String(item.id))
    setEolDate(item.eol_date || '')
    setEosDate(item.eos_date || '')
  }

  function handleSoftwareChange(e) {
    const value = e.target.value
    if (value === NEW_OPTION) {
      setShowAddSoftware(true)
      return
    }
    const item = libraryItems.find((i) => String(i.id) === value)
    if (item) applySoftwareSelection(item)
  }

  function handleSoftwareCreated(item) {
    setLibraryItems((prev) => [...prev, item])
    applySoftwareSelection(item)
    setShowAddSoftware(false)
  }

  const isNewProject = projectId === NEW_OPTION
  const projectNumberValid = PROJECT_NUMBER_RE.test(newProjectNumber)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (!customerId) {
      setError('Select a customer')
      return
    }
    if (!projectId) {
      setError('Select a project')
      return
    }
    if (isNewProject && !projectNumberValid) {
      setError('Project number must be 5 digits.')
      return
    }
    const softwareItem = libraryItems.find((i) => String(i.id) === softwareId)
    if (!softwareItem) {
      setError('Select a software item')
      return
    }

    setSaving(true)
    try {
      let finalProjectId = projectId
      if (isNewProject) {
        const project = await api.createProject({
          customer_id: Number(customerId),
          project_number: newProjectNumber,
          project_name: newProjectName,
        })
        finalProjectId = project.id
      }

      await api.createSoftwareEntry({
        project_id: Number(finalProjectId),
        software_name: softwareItem.software_name,
        version: softwareItem.version,
        eol_date: eolDate || null,
        eos_date: eosDate || null,
        license_type: licenseType,
        notes: notes || null,
      })

      onCreated()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Modal title="Add new entry" onClose={onClose} width={520}>
        <form onSubmit={handleSubmit} className="form">
          {error && <div className="form-error">{error}</div>}

          <label className="field">
            <span>Customer</span>
            <select value={customerId} onChange={handleCustomerChange} required>
              <option value="" disabled>
                Select customer...
              </option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
              <option value={NEW_OPTION}>+ Add new customer</option>
            </select>
          </label>

          <label className="field">
            <span>Project</span>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              required
              disabled={!customerId}
            >
              <option value="" disabled>
                Select project...
              </option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.project_number} — {p.project_name}
                </option>
              ))}
              <option value={NEW_OPTION}>+ Add new project</option>
            </select>
          </label>

          {isNewProject && (
            <div className="inline-panel">
              <label className="field">
                <span>Project number</span>
                <input
                  value={newProjectNumber}
                  onChange={(e) => setNewProjectNumber(e.target.value)}
                  maxLength={5}
                  required
                />
                <small className={newProjectNumber && !projectNumberValid ? 'field-hint error' : 'field-hint'}>
                  Project number must be 5 digits.
                </small>
              </label>
              <label className="field">
                <span>Project name</span>
                <input value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} required />
              </label>
            </div>
          )}

          <label className="field">
            <span>Software</span>
            <select value={softwareId} onChange={handleSoftwareChange} required>
              <option value="" disabled>
                Select software...
              </option>
              {libraryItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {softwareLabel(item)}
                </option>
              ))}
              <option value={NEW_OPTION}>+ Add new software</option>
            </select>
            <small className="field-hint">
              Pick from the Software Library, or add new software if it's not there yet.
            </small>
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
              {saving ? 'Saving...' : 'Add entry'}
            </button>
          </div>
        </form>
      </Modal>

      {showAddCustomer && <AddCustomerModal onClose={() => setShowAddCustomer(false)} onCreated={handleCustomerCreated} />}

      {showAddSoftware && (
        <SoftwareLibraryItemModal onClose={() => setShowAddSoftware(false)} onSaved={handleSoftwareCreated} />
      )}
    </>
  )
}

export default AddEntryModal
