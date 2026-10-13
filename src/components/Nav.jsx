import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'

export default function Nav() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  return <nav className="site-nav">
    <NavLink className={({ isActive }) => isActive ? 'active' : undefined} to="/posts">Posts</NavLink>
    {user && <NavLink className={({ isActive }) => isActive ? 'active' : undefined} to="/notes">My notes</NavLink>}
    {user?.role === 'admin' && <>
      <NavLink className={({ isActive }) => isActive ? 'active' : undefined} to="/admin/users">Users</NavLink>
      <NavLink className={({ isActive }) => isActive ? 'active' : undefined} to="/admin/notes">All notes</NavLink>
      <NavLink className={({ isActive }) => isActive ? 'active' : undefined} to="/admin/interests">Interests</NavLink>
    </>}
    {user ? <>
      <span>{user.name}</span>
      <button className="logout" type="button" onClick={() => { logout(); navigate('/login') }}>Log out</button>
    </> : <>
      <NavLink className={({ isActive }) => isActive ? 'active' : undefined} to="/login">Log in</NavLink>
      <NavLink className={({ isActive }) => isActive ? 'active' : undefined} to="/register">Register</NavLink>
    </>}
  </nav>
}
