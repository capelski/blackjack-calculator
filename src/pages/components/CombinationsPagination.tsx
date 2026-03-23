type CombinationsPaginationProps = {
  safePage: number
  totalPages: number
  onPrevious: () => void
  onNext: () => void
}

function CombinationsPagination({
  safePage,
  totalPages,
  onPrevious,
  onNext,
}: CombinationsPaginationProps) {
  return (
    <section className="pagination" aria-label="Combination pages">
      <button type="button" onClick={onPrevious} disabled={safePage === 0}>
        Previous
      </button>
      <span>
        Page {safePage + 1} of {totalPages}
      </span>
      <button type="button" onClick={onNext} disabled={safePage >= totalPages - 1}>
        Next
      </button>
    </section>
  )
}

export default CombinationsPagination
