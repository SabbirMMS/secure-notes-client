import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth'
import AdminRoute from './components/AdminRoute'
import Nav from './components/Nav'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Notes from './pages/Notes'
import Posts from './pages/Posts'
import UserPosts from './pages/UserPosts'
import AdminUsers from './pages/AdminUsers'
import AdminNotes from './pages/AdminNotes'
import AdminInterests from './pages/AdminInterests'

function Home() {
  const { user, loading } = useAuth()
  if (loading) return <p className="loading">Loading account...</p>
  return <Navigate to={user ? '/notes' : '/login'} replace />
}

function AppRoutes() {
  return <>
    <Nav />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/posts" element={<Posts />} />
      <Route path="/users/:id/posts" element={<UserPosts />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/notes" element={<Notes />} />
      </Route>
      <Route element={<AdminRoute />}>
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/notes" element={<AdminNotes />} />
        <Route path="/admin/interests" element={<AdminInterests />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </>
}

export default function App() {
  return <BrowserRouter><AuthProvider><AppRoutes /></AuthProvider></BrowserRouter>
}
