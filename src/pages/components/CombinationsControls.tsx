type CombinationsControlsProps = {
  standThreshold: number
  finalHandsOnly: boolean
  sequenceQuery: string
  onThresholdChange: (value: number) => void
  onFinalHandsOnlyChange: (value: boolean) => void
  onSequenceQueryChange: (value: string) => void
}

function CombinationsControls({
  standThreshold,
  finalHandsOnly,
  sequenceQuery,
  onThresholdChange,
  onFinalHandsOnlyChange,
  onSequenceQueryChange,
}: CombinationsControlsProps) {
  return (
    <section className="controls" aria-label="Stand threshold controls">
      <label htmlFor="threshold-slider">Stand threshold: {standThreshold}</label>
      <input
        id="threshold-slider"
        type="range"
        min="4"
        max="20"
        step="1"
        value={standThreshold}
        onChange={(event) => onThresholdChange(Number(event.target.value))}
      />

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
