import { numericPrefix } from '../final-scores/finalScoresLogic.ts'

export type Outcome = 'win' | 'draw' | 'lose'

export type OutcomeTotals = {
  win: number
  blackjackWin: number
  draw: number
  lose: number
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
  playerScores: Map<string, number>,
  dealerScores: Map<string, number>,
  playerLabels: string[],
  dealerLabels: string[],
): OutcomeTotals {
  const totals: OutcomeTotals = {
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
}

export function calculatePlayerRoi(totals: OutcomeTotals): {
  regularWinProbability: number
  netRoi: number
  returnPerUnit: number
} {
  const regularWinProbability = totals.win - totals.blackjackWin
  const netRoi = regularWinProbability + totals.blackjackWin * 1.5 - totals.lose

  return {
    regularWinProbability,
    netRoi,
    returnPerUnit: 1 + netRoi,
  }
}