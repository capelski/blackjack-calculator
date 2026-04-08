import { useOutletContext } from 'react-router-dom'

export type StandThresholdOutletContext = {
  standThreshold: number
}

export function useStandThreshold(): number {
  return useOutletContext<StandThresholdOutletContext>().standThreshold
}
