type CombinationsControlsProps = {
  finalHandsOnly: boolean
  sequenceQuery: string
  onFinalHandsOnlyChange: (value: boolean) => void
  onSequenceQueryChange: (value: string) => void
}

function CombinationsControls({
  finalHandsOnly,
  sequenceQuery,
  onFinalHandsOnlyChange,
  onSequenceQueryChange,
}: CombinationsControlsProps) {
  return (
    <section className="controls" aria-label="Combinations controls">
      <label className="checkbox-row" htmlFor="final-hands-only">
        <input
          id="final-hands-only"
          type="checkbox"
          checked={finalHandsOnly}
          onChange={(event) => onFinalHandsOnlyChange(event.target.checked)}
        />
        Final hands only
      </label>

      <label className="search-row" htmlFor="sequence-search">
        Card sequence filter
      </label>
      <input
        id="sequence-search"
        type="search"
        value={sequenceQuery}
        onChange={(event) => onSequenceQueryChange(event.target.value)}
        placeholder="Example: A 10 or 5, 6, 7"
      />
    </section>
  )
}

export default CombinationsControls
