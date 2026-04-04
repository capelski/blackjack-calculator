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

type ScoreComparisonRow = {
  score: string
  playerProbability: number
  dealerProbability: number
  delta: number
}

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

  const rows = useMemo(() => {
    const labels = sortScores([...new Set([...playerScores.keys(), ...dealerScores.keys()])])

    return labels.map((score) => {
      const playerProbability = playerScores.get(score) ?? 0
      const dealerProbability = dealerScores.get(score) ?? 0

      return {
        score,
        playerProbability,
        dealerProbability,
        delta: playerProbability - dealerProbability,
      }
    })
  }, [dealerScores, playerScores])

  const playerBust = playerScores.get('22+') ?? 0
  const dealerBust = dealerScores.get('22+') ?? 0
  const bustDelta = playerBust - dealerBust
  const positiveDeltaMass = rows.reduce(
    (sum, row) => sum + (row.delta > 0 ? row.delta : 0),
    0,
  )

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
        <p>Positive delta mass: {formatProbability(positiveDeltaMass)}</p>
      </section>

      <section className="combination-table" aria-label="Expected results comparison table">
        <div className="combination-table-header expected-results-header" role="row">
          <span role="columnheader">Final score</span>
          <span role="columnheader">Player probability</span>
          <span role="columnheader">Dealer probability</span>
          <span role="columnheader">Delta (player - dealer)</span>
        </div>

        <ul className="combination-list">
          {rows.map((row) => (
            <li key={row.score} className="combination-row expected-results-row" role="row">
              <span className="cell score" data-label="Final score" role="cell">
                {row.score}
              </span>
              <span className="cell probability" data-label="Player probability" role="cell">
                {formatProbability(row.playerProbability)}
              </span>
              <span className="cell probability" data-label="Dealer probability" role="cell">
                {formatProbability(row.dealerProbability)}
              </span>
              <span
                className={`cell expected-delta ${row.delta >= 0 ? 'positive' : 'negative'}`}
                data-label="Delta (player - dealer)"
                role="cell"
              >
                {row.delta >= 0 ? '+' : '-'}
                {formatProbability(Math.abs(row.delta))}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}

export default ExpectedResultsPage