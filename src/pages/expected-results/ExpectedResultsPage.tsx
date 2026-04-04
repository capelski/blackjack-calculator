import { useMemo, useState } from 'react'
import './ExpectedResultsPage.css'
import type { CombinationItem } from '../common/combinationsTreeLogic'
import {
  PAGE_SIZE,
  createTreeNavigator,
  formatProbability,
} from '../common/combinationsTreeLogic'
import StandThresholdSlider from '../common/components/StandThresholdSlider'
import { compareFinalScores, normalizedFinalScore } from '../final-scores/finalScoresLogic'

function collectFinalCombinations(standThreshold: number): CombinationItem[] {
  const treeNavigator = createTreeNavigator(standThreshold, [])
  const total = treeNavigator.getTotalCombinations(true)
  const pages = Math.ceil(total / PAGE_SIZE)
  const items: CombinationItem[] = []

  for (let page = 0; page < pages; page += 1) {
    items.push(...treeNavigator.getPage(page, PAGE_SIZE, true))
  }

  return items
}

function groupScores(combinations: CombinationItem[]): Map<string, number> {
  const grouped = new Map<string, number>()

  for (const combination of combinations) {
    const score = normalizedFinalScore(combination.score)
    grouped.set(score, (grouped.get(score) ?? 0) + combination.probability)
  }

  return grouped
}

function sortScores(scores: string[]): string[] {
  return [...scores].sort((left, right) =>
    compareFinalScores(
      { score: left, probability: 0, combinations: [] },
      { score: right, probability: 0, combinations: [] },
    ),
  )
}

function ExpectedResultsPage() {
  const [standThreshold, setStandThreshold] = useState<number>(17)

  const playerScores = useMemo(
    () => groupScores(collectFinalCombinations(standThreshold)),
    [standThreshold],
  )

  const dealerScores = useMemo(() => groupScores(collectFinalCombinations(17)), [])

  const playerLabels = useMemo(() => sortScores([...playerScores.keys()]), [playerScores])
  const dealerLabels = useMemo(() => sortScores([...dealerScores.keys()]), [dealerScores])

  const playerBust = playerScores.get('22+') ?? 0
  const dealerBust = dealerScores.get('22+') ?? 0
  const bustDelta = playerBust - dealerBust

  return (
    <main className="combination-page">
      <header className="combination-header">
        <p className="eyebrow">Blackjack Analyzer</p>
        <h1>Expected Results</h1>
        <p className="intro">
          Compare the player final score distribution for the selected stand threshold
          against the dealer distribution (dealer threshold fixed at 17).
        </p>
      </header>

      <section className="controls" aria-label="Expected results controls">
        <StandThresholdSlider
          value={standThreshold}
          inputId="expected-results-threshold"
          onChange={setStandThreshold}
        />
      </section>

      <section className="summary" aria-live="polite">
        <p>Player threshold: {standThreshold}</p>
        <p>Dealer threshold: 17</p>
        <p>Player bust delta: {formatProbability(bustDelta)}</p>
        <p>Matrix cells: {(playerLabels.length * dealerLabels.length).toLocaleString()}</p>
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
              </tr>
            </thead>
            <tbody>
              {playerLabels.map((playerScore) => {
                const playerProbability = playerScores.get(playerScore) ?? 0

                return (
                  <tr key={playerScore}>
                    <th scope="row">{playerScore}</th>
                    {dealerLabels.map((dealerScore) => {
                      const dealerProbability = dealerScores.get(dealerScore) ?? 0
                      const product = playerProbability * dealerProbability

                      return <td key={`${playerScore}-${dealerScore}`}>{formatProbability(product)}</td>
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}

export default ExpectedResultsPage