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

function Home() {
  const { user, loading } = useAuth()
  if (loading) return <p>Loading account...</p>
  return <Navigate to={user ? '/notes' : '/login'} replace />
}

function ComingSoon({ name }) { return <main><h1>{name}</h1><p>This page is in the next stage.</p></main> }

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
        <Route path="/admin/users" element={<ComingSoon name="Users" />} />
        <Route path="/admin/notes" element={<ComingSoon name="All notes" />} />
        <Route path="/admin/interests" element={<ComingSoon name="Interests" />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </>
}

export default function App() {
  return <BrowserRouter><AuthProvider><AppRoutes /></AuthProvider></BrowserRouter>
}
