import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './layout/AppLayout'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import Software from './pages/Software'
import SoftwareLibrary from './pages/SoftwareLibrary'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="customers" element={<Customers />} />
          <Route path="software" element={<Software />} />
          <Route path="software-library" element={<SoftwareLibrary />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
