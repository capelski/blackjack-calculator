import type { CombinationItem } from '../common/combinationsTreeLogic.ts'
import {
  PAGE_SIZE,
  createTreeNavigator,
} from '../common/combinationsTreeLogic.ts'
import { outcomeClass } from '../expected-results/expectedResultsLogic.ts'

export type ScoreState = {
  score: number
  handType: 'Hard' | 'Soft'
  isSoft: boolean
}

export type OutcomeTotals = {
  win: number
  draw: number
  lose: number
}

export type HitTransition = {
  total: number
  isSoft: boolean
  bust: boolean
}

export const DRAW_OPTIONS: Array<{ cardValue: number; probability: number }> = [
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

export function collectFinalCombinations(standThreshold: number): CombinationItem[] {
  const treeNavigator = createTreeNavigator(standThreshold, [])
  const total = treeNavigator.getTotalCombinations(true)
  const pages = Math.ceil(total / PAGE_SIZE)
  const items: CombinationItem[] = []

  for (let page = 0; page < pages; page += 1) {
    items.push(...treeNavigator.getPage(page, PAGE_SIZE, true))
  }

  return items
}

export function groupScores(combinations: CombinationItem[]): Map<string, number> {
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

export function computeStandOutcomes(playerScore: string, dealerScores: Map<string, number>): OutcomeTotals {
  const totals: OutcomeTotals = { win: 0, draw: 0, lose: 0 }

  for (const [dealerScore, dealerProbability] of dealerScores.entries()) {
    const result = outcomeClass(playerScore, dealerScore)
    totals[result] += dealerProbability
  }

  return totals
}

export function computeHitTransition(state: ScoreState, cardValue: number): HitTransition {
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

export function computeHitOutcomesWithThreshold(
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

export function determineThresholdAction(score: number, threshold: number): 'Stand' | 'Hit' {
  return score >= threshold ? 'Stand' : 'Hit'
}

export function formatScoreLabel(score: number, handType: 'Hard' | 'Soft'): string {
  return handType === 'Soft' ? `${score} (soft)` : `${score}`
}

export function listScoreStates(): ScoreState[] {
  const states: ScoreState[] = []

  for (let score = 21; score >= 4; score -= 1) {
    states.push({ score, handType: 'Hard', isSoft: false })

    if (score >= 12) {
      states.push({ score, handType: 'Soft', isSoft: true })
    }
  }

  return states.sort((left, right) => {
    if (left.handType !== right.handType) {
      return left.handType === 'Hard' ? -1 : 1
    }

    return left.score - right.score
  })
}
