import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'

export default function Nav() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  return <nav className="site-nav">
    <Link to="/posts">Posts</Link>
    {user && <Link to="/notes">My notes</Link>}
    {user?.role === 'admin' && <>
      <Link to="/admin/users">Users</Link>
      <Link to="/admin/notes">All notes</Link>
      <Link to="/admin/interests">Interests</Link>
    </>}
    {user ? <>
      <span>{user.name}</span>
      <button className="logout" type="button" onClick={() => { logout(); navigate('/login') }}>Log out</button>
    </> : <>
      <Link to="/login">Log in</Link>
      <Link to="/register">Register</Link>
    </>}
  </nav>
}
