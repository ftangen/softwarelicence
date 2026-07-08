import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './layout/AppLayout'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import Software from './pages/Software'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="customers" element={<Customers />} />
          <Route path="software" element={<Software />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
