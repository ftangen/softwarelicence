function toQuery(params = {}) {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
  )
  const qs = new URLSearchParams(clean).toString()
  return qs ? `?${qs}` : ''
}

async function request(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.error || `Request failed with status ${res.status}`)
  }
  return data
}

export const api = {
  getDashboard: (params) => request(`/dashboard${toQuery(params)}`),
  getSoftware: (params) => request(`/software${toQuery(params)}`),
  getCustomers: () => request('/customers'),
  getCustomerProjects: (customerId) => request(`/customers/${customerId}/projects`),
  createCustomer: (body) => request('/customers', { method: 'POST', body: JSON.stringify(body) }),
  createProject: (body) => request('/projects', { method: 'POST', body: JSON.stringify(body) }),
  createSoftwareEntry: (body) => request('/software-entries', { method: 'POST', body: JSON.stringify(body) }),
  updateSoftwareEntry: (id, body) => request(`/software-entries/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteSoftwareEntry: (id) => request(`/software-entries/${id}`, { method: 'DELETE' }),
  getSoftwareLibrary: (params) => request(`/software-library${toQuery(params)}`),
  createSoftwareLibraryItem: (body) => request('/software-library', { method: 'POST', body: JSON.stringify(body) }),
  updateSoftwareLibraryItem: (id, body) => request(`/software-library/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteSoftwareLibraryItem: (id) => request(`/software-library/${id}`, { method: 'DELETE' }),
}
