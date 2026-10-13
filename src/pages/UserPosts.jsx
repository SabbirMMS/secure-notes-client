import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../api'
import Pagination from '../components/Pagination'

const LIMIT = 10

export default function UserPosts() {
  const { id } = useParams()
  const [page, setPage] = useState(1)
  const [data, setData] = useState(null)
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { setPage(1) }, [id])

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    api(`/api/users/${id}/posts?page=${page}&limit=${LIMIT}`)
      .then((result) => {
        if (!active) return
        setData(result.data)
        setPagination(result.pagination)
      })
      .catch((error) => { if (active) setError(error.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id, page])

  return <main>
    {loading && <p className="loading">Loading user posts...</p>}
    {error && <p role="alert" className="error">{error}</p>}
    {!loading && !error && data && <>
      <h1>Posts by {data.user.name}</h1>
      <p>Interests: {data.user.interests?.length ? data.user.interests.join(', ') : 'None listed'}</p>
      {data.posts.length === 0 && <p>No posts on this page.</p>}
      <ul className="card-list">{data.posts.map((post) => <li key={post._id}>
        <h2>{post.title}</h2><p>{post.content}</p>
      </li>)}</ul>
      <Pagination page={page} hasMore={pagination?.hasMore} onPageChange={setPage} />
    </>}
  </main>
}
