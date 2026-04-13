import { createContext, useContext } from 'react'
import type { TreeDecisionPolicy } from './combinationsTreeLogic'
import type { RecursiveDecisionModel } from '../recursive-decisions/recursiveDecisionsLogic'

export type DecisionMode = 'stand-threshold' | 'recursive-decisions'

export type DecisionPolicyContextValue = {
  mode: DecisionMode
  decisionPolicy: TreeDecisionPolicy
  standThreshold: number | null
  recursiveDecisionModel: RecursiveDecisionModel | null
  doublingEnabled: boolean
}

export const DecisionPolicyContext = createContext<DecisionPolicyContextValue | null>(null)

export function useDecisionPolicyContext(): DecisionPolicyContextValue {
  const context = useContext(DecisionPolicyContext)

  if (context === null) {
    throw new Error('useDecisionPolicyContext must be used within a DecisionPolicyContext provider.')
  }

  return context
}
