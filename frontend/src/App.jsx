import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import { LoadingScreen } from './components/ui'
import LoginPage from './pages/LoginPage'
import OwnerDashboardPage from './pages/OwnerDashboardPage'
import ManagerDashboardPage from './pages/ManagerDashboardPage'
import PropertiesPage from './pages/PropertiesPage'
import PropertyDetailPage from './pages/PropertyDetailPage'
import TenantDashboardPage from './pages/TenantDashboardPage'
import { homeFor } from './utils/format'

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to={homeFor(user.role)} replace /> : <LoginPage />}
      />

      <Route element={<ProtectedRoute roles={['OWNER']} />}>
        <Route path="/owner" element={<OwnerDashboardPage />} />
        <Route path="/owner/properties" element={<PropertiesPage />} />
        <Route path="/owner/properties/:propertyId" element={<PropertyDetailPage />} />
      </Route>

      <Route element={<ProtectedRoute roles={['MANAGER']} />}>
        <Route path="/manager" element={<ManagerDashboardPage />} />
        <Route path="/manager/properties/:propertyId" element={<PropertyDetailPage />} />
      </Route>

      <Route element={<ProtectedRoute roles={['TENANT']} />}>
        <Route path="/tenant" element={<TenantDashboardPage />} />
      </Route>

      <Route path="*" element={<Navigate to={user ? homeFor(user.role) : '/login'} replace />} />
    </Routes>
  )
}
