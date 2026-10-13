import { useEffect, useState } from 'react'
import { api } from '../api'
import Pagination from '../components/Pagination'

const LIMIT = 10

export default function Notes() {
  const [page, setPage] = useState(1)
  const [reload, setReload] = useState(0)
  const [notes, setNotes] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    api(`/api/notes?page=${page}&limit=${LIMIT}`)
      .then(({ data, pagination }) => {
        if (!active) return
        if (page > 1 && pagination.totalPages > 0 && page > pagination.totalPages) {
          setPage(pagination.totalPages)
          return
        }
        setNotes(data)
        setPagination(pagination)
      })
      .catch((error) => { if (active) setError(error.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [page, reload])

  async function create(event) {
    event.preventDefault()
    setSaving(true)
    setActionError('')
    try {
      await api('/api/notes', { method: 'POST', body: { title, content } })
      setTitle('')
      setContent('')
      setPage(1)
      setReload((value) => value + 1)
    } catch (error) { setActionError(error.message) }
    finally { setSaving(false) }
  }

  function startEdit(note) {
    setEditingId(note._id)
    setEditTitle(note.title)
    setEditContent(note.content)
    setActionError('')
  }

  async function saveEdit(event) {
    event.preventDefault()
    setSaving(true)
    setActionError('')
    try {
      await api(`/api/notes/${editingId}`, { method: 'PATCH', body: { title: editTitle, content: editContent } })
      setEditingId(null)
      setReload((value) => value + 1)
    } catch (error) { setActionError(error.message) }
    finally { setSaving(false) }
  }

  async function remove(note) {
    if (!window.confirm(`Delete "${note.title}"?`)) return
    setSaving(true)
    setActionError('')
    try {
      await api(`/api/notes/${note._id}`, { method: 'DELETE' })
      setReload((value) => value + 1)
    } catch (error) { setActionError(error.message) }
    finally { setSaving(false) }
  }

  return <main>
    <h1>My notes</h1>
    <h2>Create note</h2>
    <form onSubmit={create}>
      <label>Title <input required value={title} onChange={(event) => setTitle(event.target.value)} /></label>
      <label>Content <textarea required value={content} onChange={(event) => setContent(event.target.value)} /></label>
      <button disabled={saving}>{saving ? 'Saving...' : 'Create note'}</button>
    </form>
    {actionError && <p role="alert" className="error">{actionError}</p>}
    <h2>Notes</h2>
    {loading && <p>Loading notes...</p>}
    {error && <p role="alert" className="error">{error}</p>}
    {!loading && !error && notes.length === 0 && <p>No notes yet.</p>}
    {!loading && !error && <>
      <ul>{notes.map((note) => <li key={note._id}>
        {editingId === note._id ? <form onSubmit={saveEdit}>
          <label>Title <input required value={editTitle} onChange={(event) => setEditTitle(event.target.value)} /></label>
          <label>Content <textarea required value={editContent} onChange={(event) => setEditContent(event.target.value)} /></label>
          <div><button disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>{' '}
            <button type="button" disabled={saving} onClick={() => setEditingId(null)}>Cancel</button></div>
        </form> : <>
          <h3>{note.title}</h3><p>{note.content}</p>
          <button type="button" disabled={saving} onClick={() => startEdit(note)}>Edit</button>{' '}
          <button type="button" disabled={saving} onClick={() => remove(note)}>Delete</button>
        </>}
      </li>)}</ul>
      {pagination && <Pagination page={page} totalPages={pagination.totalPages} disabled={saving} onPageChange={setPage} />}
    </>}
  </main>
}
