import { useEffect, useMemo, useState } from 'react'
import './CombinationsTreePage.css'
import CombinationsControls from './components/CombinationsControls'
import CombinationsPagination from './components/CombinationsPagination'
import CombinationsSummary from './components/CombinationsSummary'
import HandOutcomesTable from '../common/components/HandOutcomesTable'
import { useDecisionPolicyContext } from '../common/decisionPolicyContext'
import {
  PAGE_SIZE,
  createPolicyTreeNavigator,
  parseSequenceQuery,
} from '../common/combinationsTreeLogic'

function CombinationsTreePage() {
  const { decisionPolicy, mode, doublingEnabled } = useDecisionPolicyContext()
  const [finalHandsOnly, setFinalHandsOnly] = useState<boolean>(true)
  const [sequenceQuery, setSequenceQuery] = useState<string>('')
  const [page, setPage] = useState<number>(0)

  const sequenceTokens = useMemo(() => parseSequenceQuery(sequenceQuery), [sequenceQuery])
  const sequenceKey = useMemo(() => sequenceTokens.join('|'), [sequenceTokens])

  const treeNavigator = useMemo(
    () => createPolicyTreeNavigator(decisionPolicy, sequenceTokens),
    [decisionPolicy, sequenceKey],
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
  }, [decisionPolicy, finalHandsOnly, sequenceKey])

  return (
    <main className="combination-page">
      <header className="combination-header">
        <p className="eyebrow">Blackjack Analyzer</p>
        <h1>Combinations Tree</h1>
        <p className="intro">
          {mode === 'stand-threshold'
            ? 'Terminal player hands generated from a recursive card tree. The player keeps hitting until the hand score reaches the stand threshold or busts.'
            : 'Terminal player hands generated from a recursive card tree. At each score, the player chooses the action with the highest expected return per unit.'}
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

      <HandOutcomesTable
        combinations={combinations}
        keyPrefix={`tree-page-${safePage}`}
        showBetSize={mode === 'recursive-decisions' && doublingEnabled}
      />
    </main>
  )
}

export default CombinationsTreePage
