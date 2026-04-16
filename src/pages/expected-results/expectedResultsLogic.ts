import { numericPrefix } from '../final-scores/finalScoresLogic.ts'

export type Outcome = 'win' | 'draw' | 'lose'

export type OutcomeTotals = {
  win: number
  draw: number
  lose: number
  roi: number
}

export type ScoreGroup = {
  probability: number
  byBetSize: Map<number, number>
}

type ScoreAggregate = number | ScoreGroup

function scoreProbability(value: ScoreAggregate): number {
  return typeof value === 'number' ? value : value.probability
}

export function outcomeClass(playerScore: string, dealerScore: string): Outcome {
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

export function calculateOutcomeTotals(
  playerScores: Map<string, ScoreAggregate>,
  dealerScores: Map<string, ScoreAggregate>,
  playerLabels: string[],
  dealerLabels: string[],
): OutcomeTotals {
  const totals: OutcomeTotals = {
    win: 0,
    draw: 0,
    lose: 0,
    roi: 0,
  }

  for (const playerScore of playerLabels) {
    const playerAggregate = playerScores.get(playerScore) ?? 0
    const playerByBetSize = typeof playerAggregate === 'number'
      ? new Map<number, number>([[1, playerAggregate]])
      : playerAggregate.byBetSize

    for (const dealerScore of dealerLabels) {
      const dealerProbability = scoreProbability(dealerScores.get(dealerScore) ?? 0)
      const result = outcomeClass(playerScore, dealerScore)

      for (const [betSize, playerProbability] of playerByBetSize.entries()) {
        const product = playerProbability * dealerProbability

        if (result === 'win' && playerScore === 'Blackjack' && dealerScore !== 'Blackjack') {
          totals.roi += betSize * 1.5 * product
        } else if (result === 'win') {
          totals.roi += betSize * product
        } else if (result === 'lose') {
          totals.roi -= betSize * product
        }

        totals[result] += product
      }
    }
  }

  return totals
}