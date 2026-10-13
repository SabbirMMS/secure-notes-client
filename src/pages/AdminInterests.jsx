import { useEffect, useState } from 'react'
import { api } from '../api'
import Pagination from '../components/Pagination'

const LIMIT = 10

export default function AdminInterests() {
  const [page, setPage] = useState(1)
  const [interestInput, setInterestInput] = useState('')
  const [interest, setInterest] = useState('')
  const [groups, setGroups] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) })
    if (interest) params.set('interest', interest)
    api(`/api/admin/users/grouped-by-interests?${params}`)
      .then(({ data, pagination }) => {
        if (!active) return
        if (page > 1 && page > pagination.totalPages) {
          setPage(Math.max(1, pagination.totalPages))
          return
        }
        setGroups(data)
        setPagination(pagination)
      })
      .catch((error) => { if (active) setError(error.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [page, interest])

  function filter(event) {
    event.preventDefault()
    setPage(1)
    setInterest(interestInput.trim())
  }

  return <main>
    <h1>Users by interest</h1>
    <form onSubmit={filter}>
      <label>Interest (optional) <input value={interestInput} onChange={(event) => setInterestInput(event.target.value)} /></label>
      <button className="primary" disabled={loading}>Apply filter</button>
    </form>
    {loading && <p className="loading">Loading interest groups...</p>}
    {error && <p role="alert" className="error">{error}</p>}
    {!loading && !error && <>
      {groups.length === 0 && <p>No interest groups found.</p>}
      <ul className="card-list">{groups.map((group) => <li key={group._id}>
        <h2>{group._id}</h2>
        <p>Users: {group.count}</p>
        <p>{group.users.map((user) => user.name).join(', ')}</p>
      </li>)}</ul>
      {pagination && <Pagination page={page} totalPages={pagination.totalPages} disabled={loading} onPageChange={setPage} />}
    </>}
  </main>
}
