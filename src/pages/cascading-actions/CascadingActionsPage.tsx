import { useMemo, useState } from 'react'
import './CascadingActionsPage.css'
import type { CombinationItem } from '../common/combinationsTreeLogic'
import {
  PAGE_SIZE,
  createTreeNavigator,
  formatProbability,
} from '../common/combinationsTreeLogic'
import StandThresholdSlider from '../common/components/StandThresholdSlider'
import { compareFinalScores } from '../final-scores/finalScoresLogic'
import { outcomeClass } from '../expected-results/expectedResultsLogic'

type ScoreState = {
  score: number
  handType: 'Hard' | 'Soft'
  isSoft: boolean
}

type OutcomeTotals = {
  win: number
  draw: number
  lose: number
}

type ActionRow = {
  action: 'Stand' | 'Hit'
  outcomes: OutcomeTotals
  returnPerUnit: number
}

type ScoreActionGroup = {
  id: string
  score: number
  handType: 'Hard' | 'Soft'
  rows: ActionRow[]
}

type HitTransition = {
  total: number
  isSoft: boolean
  bust: boolean
}

const DRAW_OPTIONS: Array<{ cardValue: number; probability: number }> = [
  { cardValue: 11, probability: 1 / 13 },
  { cardValue: 2, probability: 1 / 13 },
  { cardValue: 3, probability: 1 / 13 },
  { cardValue: 4, probability: 1 / 13 },
  { cardValue: 5, probability: 1 / 13 },
  { cardValue: 6, probability: 1 / 13 },
  { cardValue: 7, probability: 1 / 13 },
  { cardValue: 8, probability: 1 / 13 },
  { cardValue: 9, probability: 1 / 13 },
  { cardValue: 10, probability: 4 / 13 },
]

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
    const score = combination.score.includes('(')
      ? combination.score.slice(0, combination.score.indexOf(' ('))
      : combination.score.startsWith('22')
        ? '22+'
        : combination.score

    grouped.set(score, (grouped.get(score) ?? 0) + combination.probability)
  }

  return grouped
}

function computeStandOutcomes(playerScore: string, dealerScores: Map<string, number>): OutcomeTotals {
  const totals: OutcomeTotals = { win: 0, draw: 0, lose: 0 }

  for (const [dealerScore, dealerProbability] of dealerScores.entries()) {
    const result = outcomeClass(playerScore, dealerScore)
    totals[result] += dealerProbability
  }

  return totals
}

function computeHitTransition(state: ScoreState, cardValue: number): HitTransition {
  let total = state.score + cardValue
  let isSoft = state.isSoft || cardValue === 11

  if (isSoft && total > 21) {
    total -= 10
    isSoft = false
  }

  return {
    total,
    isSoft,
    bust: total > 21,
  }
}

function computeHitOutcomesWithThreshold(
  state: ScoreState,
  dealerScores: Map<string, number>,
  threshold: number,
): OutcomeTotals {
  const totals: OutcomeTotals = { win: 0, draw: 0, lose: 0 }

  for (const draw of DRAW_OPTIONS) {
    const transition = computeHitTransition(state, draw.cardValue)

    if (transition.bust) {
      totals.lose += draw.probability
      continue
    }

    if (transition.total >= threshold) {
      const standOutcomes = computeStandOutcomes(`${transition.total}`, dealerScores)
      totals.win += standOutcomes.win * draw.probability
      totals.draw += standOutcomes.draw * draw.probability
      totals.lose += standOutcomes.lose * draw.probability
    } else {
      const nextState: ScoreState = {
        score: transition.total,
        handType: transition.isSoft ? 'Soft' : 'Hard',
        isSoft: transition.isSoft,
      }
      const nextOutcomes = computeHitOutcomesWithThreshold(nextState, dealerScores, threshold)
      totals.win += nextOutcomes.win * draw.probability
      totals.draw += nextOutcomes.draw * draw.probability
      totals.lose += nextOutcomes.lose * draw.probability
    }
  }

  return totals
}

function formatReturnPerUnit(value: number): string {
  return `${value.toFixed(4)}x`
}

function listScoreStates(): ScoreState[] {
  const states: ScoreState[] = []

  for (let score = 21; score >= 4; score -= 1) {
    states.push({ score, handType: 'Hard', isSoft: false })

    if (score >= 12) {
      states.push({ score, handType: 'Soft', isSoft: true })
    }
  }

  return states
}

function CascadingActionsPage() {
  const [standThreshold, setStandThreshold] = useState<number>(17)
  const dealerScores = useMemo(() => groupScores(collectFinalCombinations(17)), [])

  const scoreActionGroups = useMemo<ScoreActionGroup[]>(() => {
    const states = listScoreStates()

    return states.map((state) => {
      const standOutcomes = computeStandOutcomes(`${state.score}`, dealerScores)
      const hitOutcomes = computeHitOutcomesWithThreshold(state, dealerScores, standThreshold)

      const standReturnPerUnit = 1 + standOutcomes.win - standOutcomes.lose
      const hitReturnPerUnit = 1 + hitOutcomes.win - hitOutcomes.lose

      return {
        id: `${state.handType}-${state.score}`,
        score: state.score,
        handType: state.handType,
        rows: [
          {
            action: 'Stand',
            outcomes: standOutcomes,
            returnPerUnit: standReturnPerUnit,
          },
          {
            action: 'Hit',
            outcomes: hitOutcomes,
            returnPerUnit: hitReturnPerUnit,
          },
        ],
      }
    })
  }, [dealerScores, standThreshold])

  const dealerLabels = useMemo(
    () => [...dealerScores.keys()].sort((left, right) => compareFinalScores(
      { score: left, probability: 0, combinations: [] },
      { score: right, probability: 0, combinations: [] },
    )),
    [dealerScores],
  )

  return (
    <main className="combination-page">
      <header className="combination-header">
        <p className="eyebrow">Blackjack Analyzer</p>
        <h1>Cascading Actions</h1>
        <p className="intro">
          For each player score, compare expected outcomes for standing now versus
          hitting exactly one card and then standing. Hard and soft scores are shown separately.
        </p>
      </header>

      <section className="controls" aria-label="Cascading actions controls">
        <StandThresholdSlider
          value={standThreshold}
          inputId="cascading-actions-threshold"
          onChange={setStandThreshold}
        />
      </section>

      <section className="summary" aria-live="polite">
        <p>Dealer policy: stands on 17</p>
        <p>Dealer final scores: {dealerLabels.join(', ')}</p>
      </section>

      <section className="combination-table cascading-actions-shell" aria-label="Cascading actions table">
        <div className="cascading-actions-scroll">
          <table className="cascading-actions-table">
            <thead>
              <tr>
                <th scope="col">Score</th>
                <th scope="col">Hand</th>
                <th scope="col">Action</th>
                <th scope="col">Win</th>
                <th scope="col">Draw</th>
                <th scope="col">Lose</th>
                <th scope="col">Return / unit</th>
              </tr>
            </thead>
            <tbody>
              {scoreActionGroups.flatMap((group) => [
                <tr key={`${group.id}-stand`}>
                  <th scope="row" rowSpan={2} className="state-cell score-cell">{group.score}</th>
                  <th scope="row" rowSpan={2} className="state-cell hand-type-cell">{group.handType}</th>
                  <td className="action-cell stand">Stand</td>
                  <td>{formatProbability(group.rows[0].outcomes.win)}</td>
                  <td>{formatProbability(group.rows[0].outcomes.draw)}</td>
                  <td>{formatProbability(group.rows[0].outcomes.lose)}</td>
                  <td className="roi-cell">{formatReturnPerUnit(group.rows[0].returnPerUnit)}</td>
                </tr>,
                <tr key={`${group.id}-hit`}>
                  <td className="action-cell hit">Hit</td>
                  <td>{formatProbability(group.rows[1].outcomes.win)}</td>
                  <td>{formatProbability(group.rows[1].outcomes.draw)}</td>
                  <td>{formatProbability(group.rows[1].outcomes.lose)}</td>
                  <td className="roi-cell">{formatReturnPerUnit(group.rows[1].returnPerUnit)}</td>
                </tr>,
              ])}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}

export default CascadingActionsPage
