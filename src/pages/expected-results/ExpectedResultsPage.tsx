import { useMemo, useState } from 'react'
import './ExpectedResultsPage.css'
import type { CombinationItem } from '../common/combinationsTreeLogic'
import {
  PAGE_SIZE,
  createTreeNavigator,
  formatProbability,
} from '../common/combinationsTreeLogic'
import StandThresholdSlider from '../common/components/StandThresholdSlider'
import {
  compareFinalScores,
  normalizedFinalScore,
  numericPrefix,
} from '../final-scores/finalScoresLogic'

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

function outcomeClass(playerScore: string, dealerScore: string): 'win' | 'draw' | 'lose' {
  const playerBust = playerScore === '22+'
  const dealerBust = dealerScore === '22+'
  const playerBlackjack = playerScore === 'Blackjack'
  const dealerBlackjack = dealerScore === 'Blackjack'

  if (playerBust) {
    return 'lose'
  }

  if (dealerBust) {
    return 'win'
  }

  if (playerBlackjack || dealerBlackjack) {
    if (playerBlackjack && dealerBlackjack) {
      return 'draw'
    }

    return playerBlackjack ? 'win' : 'lose'
  }

  const playerValue = numericPrefix(playerScore)
  const dealerValue = numericPrefix(dealerScore)

  if (playerValue === dealerValue) {
    return 'draw'
  }

  return playerValue > dealerValue ? 'win' : 'lose'
}

function formatReturnPerUnit(value: number): string {
  return `${value.toFixed(4)}x`
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

  const outcomeTotals = useMemo(() => {
    const totals = {
      win: 0,
      blackjackWin: 0,
      draw: 0,
      lose: 0,
    }

    for (const playerScore of playerLabels) {
      const playerProbability = playerScores.get(playerScore) ?? 0

      for (const dealerScore of dealerLabels) {
        const dealerProbability = dealerScores.get(dealerScore) ?? 0
        const product = playerProbability * dealerProbability
        const result = outcomeClass(playerScore, dealerScore)

        if (result === 'win' && playerScore === 'Blackjack' && dealerScore !== 'Blackjack') {
          totals.blackjackWin += product
        }

        totals[result] += product
      }
    }

    return totals
  }, [dealerLabels, dealerScores, playerLabels, playerScores])

  const regularWinProbability = outcomeTotals.win - outcomeTotals.blackjackWin
  const playerNetRoi =
    regularWinProbability + outcomeTotals.blackjackWin * 1.5 - outcomeTotals.lose
  const playerReturnPerUnit = 1 + playerNetRoi
  const playerRoiClass = playerNetRoi >= 0 ? 'roi-positive' : 'roi-negative'

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

                return (
                  <tr key={playerScore}>
                    <th scope="row">{playerScore}</th>
                    {dealerLabels.map((dealerScore) => {
                      const dealerProbability = dealerScores.get(dealerScore) ?? 0
                      const product = playerProbability * dealerProbability
                      const result = outcomeClass(playerScore, dealerScore)

                      return (
                        <td key={`${playerScore}-${dealerScore}`} className={`expected-cell ${result}`}>
                          {formatProbability(product)}
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