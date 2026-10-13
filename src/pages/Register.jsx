import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await register(name, email, password)
      navigate('/notes', { replace: true })
    } catch (error) { setError(error.message) }
    finally { setSaving(false) }
  }

  return <main>
    <h1>Register</h1>
    <form onSubmit={submit}>
      <label>Name <input required value={name} onChange={(e) => setName(e.target.value)} /></label>
      <label>Email <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
      <label>Password <input type="password" minLength="8" required value={password} onChange={(e) => setPassword(e.target.value)} /></label>
      <button disabled={saving}>{saving ? 'Registering...' : 'Register'}</button>
    </form>
    {error && <p role="alert" className="error">{error}</p>}
    <p>Already registered? <Link to="/login">Log in</Link></p>
  </main>
}
