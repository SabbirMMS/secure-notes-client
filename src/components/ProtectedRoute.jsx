import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../auth'

export default function ProtectedRoute() {
  const { user, loading, error } = useAuth()
  if (loading) return <p>Loading account...</p>
  if (error) return <p role="alert" className="error">{error}</p>
  return user ? <Outlet /> : <Navigate to="/login" replace />
}
