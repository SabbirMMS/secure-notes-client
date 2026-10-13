import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../auth'

export default function AdminRoute() {
  const { user, loading, error } = useAuth()
  if (loading) return <p>Loading account...</p>
  if (error) return <p role="alert" className="error">{error}</p>
  if (!user) return <Navigate to="/login" replace />
  return user.role === 'admin' ? <Outlet /> : <Navigate to="/notes" replace />
}
