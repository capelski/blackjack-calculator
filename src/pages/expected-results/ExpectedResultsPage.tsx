import { useMemo } from 'react'
import './ExpectedResultsPage.css'
import {
  type CombinationItem,
  formatProbability,
} from '../common/combinationsTreeLogic'
import {
  compareFinalScores,
  normalizedFinalScore,
} from '../final-scores/finalScoresLogic'
import { useDecisionPolicyContext } from '../common/decisionPolicyContext'
import { collectFinalCombinationsWithPolicy } from '../common/finalCombinationsPolicyLogic'
import {
  calculateOutcomeTotals,
  calculatePlayerRoi,
  outcomeClass,
} from './expectedResultsLogic'

type ScoreGroup = {
  probability: number
  byBetSize: Map<number, number>
}

function groupScores(combinations: CombinationItem[]): Map<string, ScoreGroup> {
  const grouped = new Map<string, ScoreGroup>()

  for (const combination of combinations) {
    const score = normalizedFinalScore(combination.score)
    const group = grouped.get(score) ?? {
      probability: 0,
      byBetSize: new Map<number, number>(),
    }

    group.probability += combination.probability
    group.byBetSize.set(
      combination.betSize,
      (group.byBetSize.get(combination.betSize) ?? 0) + combination.probability,
    )

    grouped.set(score, group)
  }

  return grouped
}

function flattenScoreGroups(groups: Map<string, ScoreGroup>): Map<string, number> {
  return new Map(
    [...groups.entries()].map(([score, group]) => [score, group.probability]),
  )
}

function sortScores(scores: string[]): string[] {
  return [...scores].sort((left, right) =>
    compareFinalScores(
      { score: left, probability: 0, combinations: [] },
      { score: right, probability: 0, combinations: [] },
    ),
  )
}

function formatReturnPerUnit(value: number): string {
  return `${value.toFixed(4)}x`
}

function ExpectedResultsPage() {
  const { decisionPolicy, mode } = useDecisionPolicyContext()

  const playerScoreGroups = useMemo(
    () => groupScores(collectFinalCombinationsWithPolicy(decisionPolicy)),
    [decisionPolicy],
  )

  const dealerScoreGroups = useMemo(
    () => groupScores(collectFinalCombinationsWithPolicy(
      ({ score, cardCount }) => (cardCount >= 2 && score >= 17 ? 'Stand' : 'Hit'),
    )),
    [],
  )

  const playerScores = useMemo(() => flattenScoreGroups(playerScoreGroups), [playerScoreGroups])
  const dealerScores = useMemo(() => flattenScoreGroups(dealerScoreGroups), [dealerScoreGroups])

  const playerBreakdownByScore = useMemo(
    () => new Map(
      [...playerScoreGroups.entries()].map(([score, group]) => [
        score,
        [...group.byBetSize.entries()]
          .map(([betSize, probability]) => ({ betSize, probability }))
          .sort((left, right) => left.betSize - right.betSize),
      ]),
    ),
    [playerScoreGroups],
  )

  const playerLabels = useMemo(() => sortScores([...playerScores.keys()]), [playerScores])
  const dealerLabels = useMemo(() => sortScores([...dealerScores.keys()]), [dealerScores])

  const outcomeTotals = useMemo(
    () => calculateOutcomeTotals(playerScores, dealerScores, playerLabels, dealerLabels),
    [dealerLabels, dealerScores, playerLabels, playerScores],
  )
  const playerRoi = useMemo(() => calculatePlayerRoi(outcomeTotals), [outcomeTotals])
  const playerNetRoi = playerRoi.netRoi
  const playerReturnPerUnit = playerRoi.returnPerUnit
  const playerRoiClass = playerNetRoi >= 0 ? 'roi-positive' : 'roi-negative'

  return (
    <main className="combination-page">
      <header className="combination-header">
        <p className="eyebrow">Blackjack Analyzer</p>
        <h1>Expected Results</h1>
        <p className="intro">
          {mode === 'stand-threshold'
            ? 'Compare the player final score distribution for the selected stand threshold against the dealer distribution (dealer threshold fixed at 17).'
            : 'Compare the recursive-policy player final score distribution against the dealer distribution (dealer threshold fixed at 17).'}
        </p>
      </header>
      <section className="expected-summary" aria-label="Expected outcomes summary">
        <article className="expected-summary-card win">
          <h2>Wins</h2>
          <p>{formatProbability(outcomeTotals.win)}</p>
        </article>
        <article className="expected-summary-card draw">
          <h2>Draws</h2>
          <p>{formatProbability(outcomeTotals.draw)}</p>
        </article>
        <article className="expected-summary-card lose">
          <h2>Loses</h2>
          <p>{formatProbability(outcomeTotals.lose)}</p>
        </article>
        <article className={`expected-summary-card roi ${playerRoiClass}`}>
          <h2>Player ROI</h2>
          <p>{formatReturnPerUnit(playerReturnPerUnit)}</p>
          <span className="expected-summary-card-meta">
            Net {formatProbability(playerNetRoi)} per unit
          </span>
        </article>
      </section>

      <section className="combination-table expected-matrix-shell" aria-label="Expected results matrix">
        <div className="expected-matrix-scroll">
          <table className="expected-matrix-table">
            <thead>
              <tr>
                <th scope="col">Player \ Dealer</th>
                {dealerLabels.map((dealerScore) => (
                  <th scope="col" key={dealerScore}>
                    {dealerScore}
                  </th>
                ))}
                <th scope="col">Total</th>
              </tr>
            </thead>
            <tbody>
              {playerLabels.map((playerScore) => {
                const playerProbability = playerScores.get(playerScore) ?? 0
                const playerBreakdown = playerBreakdownByScore.get(playerScore) ?? []

                return (
                  <tr key={playerScore}>
                    <th scope="row">{playerScore}</th>
                    {dealerLabels.map((dealerScore) => {
                      const dealerProbability = dealerScores.get(dealerScore) ?? 0
                      const result = outcomeClass(playerScore, dealerScore)

                      return (
                        <td key={`${playerScore}-${dealerScore}`} className={`expected-cell ${result}`}>
                          {playerBreakdown.map((entry) => (
                            <div key={`${playerScore}-${dealerScore}-${entry.betSize}`} className="expected-cell-breakdown">
                              {entry.betSize === 1
                                ? formatProbability(entry.probability * dealerProbability)
                                : `${entry.betSize}x: ${formatProbability(entry.probability * dealerProbability)}`}
                            </div>
                          ))}
                        </td>
                      )
                    })}
                    <td className="expected-total-cell">{formatProbability(playerProbability)}</td>
                  </tr>
                )
              })}
              <tr>
                <th scope="row">Total</th>
                {dealerLabels.map((dealerScore) => {
                  const dealerProbability = dealerScores.get(dealerScore) ?? 0

                  return (
                    <td key={`total-${dealerScore}`} className="expected-total-cell">
                      {formatProbability(dealerProbability)}
                    </td>
                  )
                })}
                <td className="expected-total-cell">{formatProbability(1)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}

export default ExpectedResultsPage