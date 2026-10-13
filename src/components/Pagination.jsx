export default function Pagination({ page, totalPages, hasMore, onPageChange, disabled = false }) {
  const lastPage = Math.max(1, totalPages || 1)
  const canGoNext = hasMore === undefined ? page < lastPage : hasMore

  return <nav aria-label="Pagination">
    <button type="button" disabled={disabled || page <= 1} onClick={() => onPageChange(page - 1)}>Previous</button>
    <span>{hasMore === undefined ? `Page ${page} of ${lastPage}` : `Page ${page}`}</span>
    <button type="button" disabled={disabled || !canGoNext} onClick={() => onPageChange(page + 1)}>Next</button>
  </nav>
}
