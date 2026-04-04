import type { CombinationItem } from '../common/combinationsTreeLogic'

export type FinalScoreGroup = {
  score: string
  probability: number
  combinations: CombinationItem[]
}

export function numericPrefix(value: string): number {
  const match = value.match(/^\d+/)
  return match ? Number(match[0]) : Number.POSITIVE_INFINITY
}

export function compareFinalScores(a: FinalScoreGroup, b: FinalScoreGroup): number {
  const aBlackjack = a.score === 'Blackjack'
  const bBlackjack = b.score === 'Blackjack'

  if (aBlackjack !== bBlackjack) {
    return aBlackjack ? -1 : 1
  }

  const aValue = numericPrefix(a.score)
  const bValue = numericPrefix(b.score)
  const aBust = a.score === '22+'
  const bBust = b.score === '22+'

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

export function normalizedFinalScore(score: string): string {
  if (score === '22+' || score.includes('(bust)')) {
    return '22+'
  }

  const numericScore = numericPrefix(score)

  if (!Number.isFinite(numericScore)) {
    return score
  }

  return `${numericScore}`
}