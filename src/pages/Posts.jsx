import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'
import Pagination from '../components/Pagination'

const LIMIT = 10

export default function Posts() {
  const { user } = useAuth()
  const [page, setPage] = useState(1)
  const [reload, setReload] = useState(0)
  const [posts, setPosts] = useState([])
  const [authors, setAuthors] = useState({})
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [authorError, setAuthorError] = useState('')
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    setAuthorError('')
    api(`/api/posts?page=${page}&limit=${LIMIT}`)
      .then(async ({ data, pagination }) => {
        if (page > 1 && pagination.totalPages > 0 && page > pagination.totalPages) {
          if (active) setPage(pagination.totalPages)
          return
        }
        const ids = [...new Set(data.map((post) => post.author))]
        let failedAuthorCount = 0
        const names = await Promise.all(ids.map(async (id) => {
          try {
            const result = await api(`/api/users/${id}/posts?page=1&limit=1`)
            return [id, result.data.user.name]
          } catch { failedAuthorCount += 1; return [id, id] }
        }))
        if (active) {
          setPosts(data)
          setPagination(pagination)
          setAuthors(Object.fromEntries(names))
          if (failedAuthorCount) setAuthorError(`Could not load ${failedAuthorCount} author name(s). Showing IDs instead.`)
        }
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
      await api('/api/posts', { method: 'POST', body: { title, content } })
      setTitle('')
      setContent('')
      setPage(1)
      setReload((value) => value + 1)
    } catch (error) { setActionError(error.message) }
    finally { setSaving(false) }
  }

  async function remove(post) {
    if (!window.confirm(`Delete "${post.title}"?`)) return
    setSaving(true)
    setActionError('')
    try {
      await api(`/api/posts/${post._id}`, { method: 'DELETE' })
      setReload((value) => value + 1)
    } catch (error) { setActionError(error.message) }
    finally { setSaving(false) }
  }

  return <main>
    <h1>Posts</h1>
    {user && <>
      <h2>Create post</h2>
      <form onSubmit={create}>
        <label>Title <input required value={title} onChange={(event) => setTitle(event.target.value)} /></label>
        <label>Content <textarea required value={content} onChange={(event) => setContent(event.target.value)} /></label>
        <button className="primary" disabled={saving}>{saving ? 'Saving...' : 'Create post'}</button>
      </form>
    </>}
    {actionError && <p role="alert" className="error">{actionError}</p>}
    {loading && <p className="loading">Loading posts...</p>}
    {error && <p role="alert" className="error">{error}</p>}
    {authorError && <p role="alert" className="error">{authorError}</p>}
    {!loading && !error && posts.length === 0 && <p>No posts yet.</p>}
    {!loading && !error && <>
      <ul className="card-list">{posts.map((post) => <li key={post._id}>
        <h2>{post.title}</h2><p>{post.content}</p>
        <p>By <Link to={`/users/${post.author}/posts`}>{authors[post.author] || post.author}</Link></p>
        {(user?._id === post.author || user?.role === 'admin') &&
          <button className="danger" type="button" disabled={saving} onClick={() => remove(post)}>Delete</button>}
      </li>)}</ul>
      {pagination && <Pagination page={page} totalPages={pagination.totalPages} disabled={saving} onPageChange={setPage} />}
    </>}
  </main>
}
