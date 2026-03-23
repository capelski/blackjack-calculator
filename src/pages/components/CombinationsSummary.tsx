type CombinationsSummaryProps = {
  totalCombinations: number
  safePage: number
  pageSize: number
}

function CombinationsSummary({ totalCombinations, safePage, pageSize }: CombinationsSummaryProps) {
  const from = totalCombinations === 0 ? 0 : safePage * pageSize + 1
  const to = Math.min((safePage + 1) * pageSize, totalCombinations)

  return (
    <section className="summary" aria-live="polite">
      <p>Total combinations: {totalCombinations.toLocaleString()}</p>
      <p>
        Showing {from}-{to}
      </p>
    </section>
  )
}

export default CombinationsSummary
