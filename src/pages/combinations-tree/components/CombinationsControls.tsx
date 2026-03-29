import StandThresholdSlider from '../../common/components/StandThresholdSlider'

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
      <StandThresholdSlider
        value={standThreshold}
        inputId="threshold-slider"
        onChange={onThresholdChange}
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
