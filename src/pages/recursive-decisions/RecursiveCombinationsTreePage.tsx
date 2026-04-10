import { useEffect, useMemo, useState } from 'react'
import CombinationsControls from '../combinations-tree/components/CombinationsControls'
import CombinationsPagination from '../combinations-tree/components/CombinationsPagination'
import CombinationsSummary from '../combinations-tree/components/CombinationsSummary'
import HandOutcomesTable from '../common/components/HandOutcomesTable'
import {
  PAGE_SIZE,
  createPolicyTreeNavigator,
  parseSequenceQuery,
} from '../common/combinationsTreeLogic'
import {
  createDealerScoresForStandardRules,
  createRecursiveDecisionModel,
} from './recursiveDecisionsLogic'

function RecursiveCombinationsTreePage() {
  const [finalHandsOnly, setFinalHandsOnly] = useState<boolean>(true)
  const [sequenceQuery, setSequenceQuery] = useState<string>('')
  const [page, setPage] = useState<number>(0)

  const sequenceTokens = useMemo(() => parseSequenceQuery(sequenceQuery), [sequenceQuery])
  const sequenceKey = useMemo(() => sequenceTokens.join('|'), [sequenceTokens])

  const dealerScores = useMemo(() => createDealerScoresForStandardRules(), [])
  const decisionModel = useMemo(() => createRecursiveDecisionModel(dealerScores), [dealerScores])
  const treePolicy = useMemo(() => decisionModel.createTreePolicy(), [decisionModel])

  const treeNavigator = useMemo(
    () => createPolicyTreeNavigator(treePolicy, sequenceTokens),
    [sequenceKey, treePolicy],
  )

  const totalCombinations = useMemo(
    () => treeNavigator.getTotalCombinations(finalHandsOnly),
    [finalHandsOnly, treeNavigator],
  )

  const totalPages = Math.max(1, Math.ceil(totalCombinations / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)

  const combinations = useMemo(
    () => treeNavigator.getPage(safePage, PAGE_SIZE, finalHandsOnly),
    [finalHandsOnly, safePage, treeNavigator],
  )

  useEffect(() => {
    setPage(0)
  }, [finalHandsOnly, sequenceKey])

  return (
    <main className="combination-page">
      <header className="combination-header">
        <p className="eyebrow">Blackjack Analyzer</p>
        <h1>Combinations Tree</h1>
        <p className="intro">
          Terminal player hands generated from the recursive decision policy. At every
          non-terminal state, the player chooses stand or hit based on highest expected ROI.
        </p>
      </header>

      <CombinationsControls
        finalHandsOnly={finalHandsOnly}
        sequenceQuery={sequenceQuery}
        onFinalHandsOnlyChange={setFinalHandsOnly}
        onSequenceQueryChange={setSequenceQuery}
      />

      <CombinationsSummary
        totalCombinations={totalCombinations}
        safePage={safePage}
        pageSize={PAGE_SIZE}
      />

      <CombinationsPagination
        safePage={safePage}
        totalPages={totalPages}
        onPrevious={() => setPage((current) => Math.max(0, current - 1))}
        onNext={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
      />

      <HandOutcomesTable combinations={combinations} keyPrefix={`recursive-tree-${safePage}`} />
    </main>
  )
}

export default RecursiveCombinationsTreePage
