import { useMemo, useState } from 'react'
import './FinalScoresPage.css'
import type { CombinationItem } from '../common/combinationsTreeLogic'
import {
  PAGE_SIZE,
  createTreeNavigator,
  formatProbability,
} from '../common/combinationsTreeLogic'
import StandThresholdSlider from '../common/components/StandThresholdSlider'
import FinalScoreModal from './components/FinalScoreModal'

type FinalScoreGroup = {
  score: string
  probability: number
  combinations: CombinationItem[]
}

function numericPrefix(value: string): number {
  const match = value.match(/^\d+/)
  return match ? Number(match[0]) : Number.POSITIVE_INFINITY
}

function compareFinalScores(a: FinalScoreGroup, b: FinalScoreGroup): number {
  const aBlackjack = a.score === 'Blackjack'
  const bBlackjack = b.score === 'Blackjack'

  if (aBlackjack !== bBlackjack) {
    return aBlackjack ? -1 : 1
  }

  const aValue = numericPrefix(a.score)
  const bValue = numericPrefix(b.score)
  const aBust = a.score.includes('(bust)')
  const bBust = b.score.includes('(bust)')

  if (aBust !== bBust) {
    return aBust ? 1 : -1
  }

  if (aBust && bBust) {
    return aValue - bValue
  }

  if (!Number.isFinite(aValue) && !Number.isFinite(bValue)) {
    return a.score.localeCompare(b.score)
  }

  if (!Number.isFinite(aValue)) {
    return 1
  }

  if (!Number.isFinite(bValue)) {
    return -1
  }

  return bValue - aValue
}

function normalizedFinalScore(score: string): string {
  const numericScore = numericPrefix(score)

  if (!Number.isFinite(numericScore)) {
    return score
  }

  if (score.includes('(bust)')) {
    return `${numericScore} (bust)`
  }

  return `${numericScore}`
}

function FinalScoresPage() {
  const [standThreshold, setStandThreshold] = useState<number>(17)
  const [openScore, setOpenScore] = useState<string | null>(null)

  const treeNavigator = useMemo(() => createTreeNavigator(standThreshold, []), [standThreshold])

  const finalCombinations = useMemo(() => {
    const total = treeNavigator.getTotalCombinations(true)
    const pages = Math.ceil(total / PAGE_SIZE)
    const items: CombinationItem[] = []

    for (let page = 0; page < pages; page += 1) {
      items.push(...treeNavigator.getPage(page, PAGE_SIZE, true))
    }

    return items
  }, [treeNavigator])

  const groupedScores = useMemo(() => {
    const grouped = new Map<string, FinalScoreGroup>()

    for (const combination of finalCombinations) {
      const normalizedScore = normalizedFinalScore(combination.score)
      const existing = grouped.get(normalizedScore)

      if (existing) {
        existing.probability += combination.probability
        existing.combinations.push(combination)
        continue
      }

      grouped.set(normalizedScore, {
        score: normalizedScore,
        probability: combination.probability,
        combinations: [combination],
      })
    }

    return [...grouped.values()].sort(compareFinalScores)
  }, [finalCombinations])

  const selectedGroup = useMemo(
    () => groupedScores.find((group) => group.score === openScore) ?? null,
    [groupedScores, openScore],
  )

  return (
    <main className="combination-page">
      <header className="combination-header">
        <p className="eyebrow">Blackjack Analyzer</p>
        <h1>Final Scores</h1>
        <p className="intro">
          Final hand outcomes grouped by score. Move the stand threshold to regenerate
          the tree and see how much probability mass lands in each final score.
        </p>
      </header>

      <section className="controls" aria-label="Stand threshold controls">
        <StandThresholdSlider
          value={standThreshold}
          inputId="final-scores-threshold"
          onChange={setStandThreshold}
        />
      </section>

      <section className="summary" aria-live="polite">
        <p>Total final score groups: {groupedScores.length}</p>
        <p>Total final combinations: {finalCombinations.length.toLocaleString()}</p>
      </section>

      <section className="combination-table" aria-label="Grouped final scores">
        <div className="combination-table-header final-scores-header" role="row">
          <span role="columnheader">Final score</span>
          <span role="columnheader">Total probability</span>
          <span role="columnheader">Combinations</span>
          <span role="columnheader">Details</span>
        </div>

        <ul className="combination-list">
          {groupedScores.map((group) => (
            <li key={group.score} className="combination-row final-scores-row" role="row">
              <span className="cell score" data-label="Final score" role="cell">
                {group.score}
              </span>
              <span className="cell probability" data-label="Total probability" role="cell">
                {formatProbability(group.probability)}
              </span>
              <span className="cell" data-label="Combinations" role="cell">
                {group.combinations.length.toLocaleString()}
              </span>
              <span className="cell" data-label="Details" role="cell">
                <button
                  type="button"
                  className="view-combinations-button"
                  onClick={() => setOpenScore(group.score)}
                >
                  View combinations
                </button>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <FinalScoreModal
        isOpen={selectedGroup !== null}
        title={selectedGroup ? `Final score ${selectedGroup.score}` : ''}
        onClose={() => setOpenScore(null)}
        combinations={selectedGroup?.combinations ?? []}
      />
    </main>
  )
}

export default FinalScoresPage
