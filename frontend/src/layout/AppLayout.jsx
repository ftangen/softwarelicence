import { NavLink, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import './AppLayout.css'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/customers', label: 'Customers' },
  { to: '/software', label: 'Software' },
]

function AppLayout() {
  const [apiStatus, setApiStatus] = useState('checking...')

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setApiStatus(data.status))
      .catch(() => setApiStatus('unreachable'))
  }, [])

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-title">Software & License Tracker</div>
        <nav>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="api-status">API: {apiStatus}</div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout
