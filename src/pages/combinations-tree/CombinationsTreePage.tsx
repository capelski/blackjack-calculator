import { useEffect, useMemo, useState } from 'react'
import './CombinationsTreePage.css'
import CombinationsControls from './components/CombinationsControls'
import CombinationsPagination from './components/CombinationsPagination'
import CombinationsSummary from './components/CombinationsSummary'
import CombinationsTable from './components/CombinationsTable'
import {
  PAGE_SIZE,
  createTreeNavigator,
  parseSequenceQuery,
} from './combinationsTreeLogic'

function CombinationsTreePage() {
  const [standThreshold, setStandThreshold] = useState<number>(17)
  const [finalHandsOnly, setFinalHandsOnly] = useState<boolean>(true)
  const [sequenceQuery, setSequenceQuery] = useState<string>('')
  const [page, setPage] = useState<number>(0)

  const sequenceTokens = useMemo(() => parseSequenceQuery(sequenceQuery), [sequenceQuery])
  const sequenceKey = useMemo(() => sequenceTokens.join('|'), [sequenceTokens])

  const treeNavigator = useMemo(
    () => createTreeNavigator(standThreshold, sequenceTokens),
    [sequenceKey, standThreshold],
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
  }, [finalHandsOnly, sequenceKey, standThreshold])

  return (
    <main className="combination-page">
      <header className="combination-header">
        <p className="eyebrow">Blackjack Analyzer</p>
        <h1>Combinations Tree</h1>
        <p className="intro">
          Terminal player hands generated from a recursive card tree. The player keeps
          hitting until the hand score reaches the stand threshold or busts.
        </p>
      </header>

      <CombinationsControls
        standThreshold={standThreshold}
        finalHandsOnly={finalHandsOnly}
        sequenceQuery={sequenceQuery}
        onThresholdChange={setStandThreshold}
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

      <CombinationsTable combinations={combinations} safePage={safePage} />
    </main>
  )
}

export default CombinationsTreePage
