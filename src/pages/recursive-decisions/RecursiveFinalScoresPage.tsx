import { useMemo, useState } from 'react'
import type { CombinationItem } from '../common/combinationsTreeLogic'
import { formatProbability } from '../common/combinationsTreeLogic'
import FinalScoreModal from '../final-scores/components/FinalScoreModal'
import {
  type FinalScoreGroup,
  compareFinalScores,
  normalizedFinalScore,
} from '../final-scores/finalScoresLogic'
import {
  collectRecursiveFinalCombinations,
  createDealerScoresForStandardRules,
  createRecursiveDecisionModel,
} from './recursiveDecisionsLogic'

function RecursiveFinalScoresPage() {
  const [openScore, setOpenScore] = useState<string | null>(null)

  const dealerScores = useMemo(() => createDealerScoresForStandardRules(), [])
  const decisionModel = useMemo(() => createRecursiveDecisionModel(dealerScores), [dealerScores])
  const treePolicy = useMemo(() => decisionModel.createTreePolicy(), [decisionModel])

  const finalCombinations = useMemo<CombinationItem[]>(
    () => collectRecursiveFinalCombinations(treePolicy),
    [treePolicy],
  )

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
          Final hand outcomes grouped by score using recursive action selection.
          Each hand path follows the action with the highest expected return.
        </p>
      </header>
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

export default RecursiveFinalScoresPage
