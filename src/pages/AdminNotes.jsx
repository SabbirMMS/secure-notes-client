import { useEffect, useState } from 'react'
import { api } from '../api'
import Pagination from '../components/Pagination'

const LIMIT = 10

export default function AdminNotes() {
  const [page, setPage] = useState(1)
  const [ownerInput, setOwnerInput] = useState('')
  const [owner, setOwner] = useState('')
  const [notes, setNotes] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) })
    if (owner) params.set('owner', owner)
    api(`/api/admin/notes?${params}`)
      .then(({ data, pagination }) => {
        if (!active) return
        if (page > 1 && page > pagination.totalPages) {
          setPage(Math.max(1, pagination.totalPages))
          return
        }
        setNotes(data)
        setPagination(pagination)
      })
      .catch((error) => { if (active) setError(error.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [page, owner])

  function filter(event) {
    event.preventDefault()
    setPage(1)
    setOwner(ownerInput.trim())
  }

  return <main>
    <h1>All notes</h1>
    <form onSubmit={filter}>
      <label>Owner ID (optional) <input value={ownerInput} onChange={(event) => setOwnerInput(event.target.value)} /></label>
      <button className="primary" disabled={loading}>Apply filter</button>
    </form>
    {loading && <p className="loading">Loading notes...</p>}
    {error && <p role="alert" className="error">{error}</p>}
    {!loading && !error && <>
      {notes.length === 0 && <p>No notes found.</p>}
      <div className="table-scroll"><table>
        <thead><tr><th>Title</th><th>Content</th><th>Owner ID</th><th>Created</th></tr></thead>
        <tbody>{notes.map((note) => <tr key={note._id}>
          <td>{note.title}</td><td>{note.content}</td><td>{note.owner}</td>
          <td>{new Date(note.createdAt).toLocaleString()}</td>
        </tr>)}</tbody>
      </table></div>
      {pagination && <Pagination page={page} totalPages={pagination.totalPages} disabled={loading} onPageChange={setPage} />}
    </>}
  </main>
}
