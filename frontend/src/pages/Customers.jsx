import { useEffect, useState } from 'react'
import { api } from '../api/client'
import AddCustomerModal from '../components/AddCustomerModal'
import './Customers.css'

function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddCustomer, setShowAddCustomer] = useState(false)

  function load() {
    setLoading(true)
    api
      .getCustomers()
      .then((data) => {
        setCustomers(data)
        setError(null)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  function handleCreated() {
    setShowAddCustomer(false)
    load()
  }

  return (
    <div>
      <div className="page-header">
        <h1>Customers</h1>
        <button type="button" className="btn-primary" onClick={() => setShowAddCustomer(true)}>
          New customer
        </button>
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="customer-grid">
        {customers.map((customer) => (
          <div key={customer.id} className="customer-card">
            <div className="customer-card-header">
              <h3>{customer.name}</h3>
              <div className="env-badges">
                {customer.environment_types.map((type) => (
                  <span key={type} className="env-badge">
                    {type}
                  </span>
                ))}
              </div>
            </div>
            <div className="customer-card-stats">
              <div>
                <strong>{customer.project_count}</strong> projects
              </div>
              <div>
                <strong>{customer.asset_count}</strong> assets
              </div>
              <div className="tone-critical">
                <strong>{customer.critical_count}</strong> critical
              </div>
              <div className="tone-approaching">
                <strong>{customer.approaching_count}</strong> approaching
              </div>
            </div>
          </div>
        ))}

        <button type="button" className="customer-card add-customer-card" onClick={() => setShowAddCustomer(true)}>
          + Add new customer
        </button>
      </div>

      {!loading && customers.length === 0 && <div className="empty-state">No customers registered yet.</div>}

      {showAddCustomer && <AddCustomerModal onClose={() => setShowAddCustomer(false)} onCreated={handleCreated} />}
    </div>
  )
}

export default Customers
