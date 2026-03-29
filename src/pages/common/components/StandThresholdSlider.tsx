type StandThresholdSliderProps = {
  value: number
  inputId: string
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
}

function StandThresholdSlider({
  value,
  inputId,
  onChange,
  min = 4,
  max = 20,
  step = 1,
}: StandThresholdSliderProps) {
  return (
    <>
      <label htmlFor={inputId}>Stand threshold: {value}</label>
      <input
        id={inputId}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </>
  )
}

export default StandThresholdSlider
