import assert from 'node:assert/strict'
import { Given, Then, When } from '@cucumber/cucumber'

import {
  calculateOutcomeTotals,
  calculatePlayerRoi,
  type Outcome,
  type OutcomeTotals,
  outcomeClass,
} from './expectedResultsLogic.ts'

type ExpectedResultsWorldState = {
  playerScores: Map<string, number>
  dealerScores: Map<string, number>
  outcome: Outcome | null
  totals: OutcomeTotals | null
  roi:
    | {
        regularWinProbability: number
        netRoi: number
        returnPerUnit: number
      }
    | null
}

const state: ExpectedResultsWorldState = {
  playerScores: new Map(),
  dealerScores: new Map(),
  outcome: null,
  totals: null,
  roi: null,
}

function parseProbabilityMap(raw: string): Map<string, number> {
  const entries = raw
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .map((item) => {
      const [score, probability] = item.split('=').map((part) => part.trim())
      assert.ok(score && probability, `Invalid score-probability pair: ${item}`)
      return [score, Number(probability)] as const
    })

  return new Map(entries)
}

When(
  'I classify expected-result outcome for player score {string} and dealer score {string}',
  (playerScore: string, dealerScore: string) => {
    state.outcome = outcomeClass(playerScore, dealerScore)
  },
)

Then('the expected-result outcome should be {string}', (expected: Outcome) => {
  assert.equal(state.outcome, expected)
})

Given('player expected-result probabilities {string}', (raw: string) => {
  state.playerScores = parseProbabilityMap(raw)
  state.totals = null
  state.roi = null
})

Given('dealer expected-result probabilities {string}', (raw: string) => {
  state.dealerScores = parseProbabilityMap(raw)
  state.totals = null
  state.roi = null
})

When('I aggregate expected-result outcomes', () => {
  const playerLabels = [...state.playerScores.keys()]
  const dealerLabels = [...state.dealerScores.keys()]
  state.totals = calculateOutcomeTotals(
    state.playerScores,
    state.dealerScores,
    playerLabels,
    dealerLabels,
  )
})

Then('expected-result wins should be approximately {float}', (expected: number) => {
  assert.ok(state.totals, 'Expected totals to be computed')
  assert.ok(Math.abs((state.totals?.win ?? 0) - expected) < 1e-12)
})

Then('expected-result blackjack wins should be approximately {float}', (expected: number) => {
  assert.ok(state.totals, 'Expected totals to be computed')
  assert.ok(Math.abs((state.totals?.blackjackWin ?? 0) - expected) < 1e-12)
})

Then('expected-result draws should be approximately {float}', (expected: number) => {
  assert.ok(state.totals, 'Expected totals to be computed')
  assert.ok(Math.abs((state.totals?.draw ?? 0) - expected) < 1e-12)
})

Then('expected-result losses should be approximately {float}', (expected: number) => {
  assert.ok(state.totals, 'Expected totals to be computed')
  assert.ok(Math.abs((state.totals?.lose ?? 0) - expected) < 1e-12)
})

Then('expected-result outcome probabilities should sum to approximately {float}', (expected: number) => {
  assert.ok(state.totals, 'Expected totals to be computed')
  const total = (state.totals?.win ?? 0) + (state.totals?.draw ?? 0) + (state.totals?.lose ?? 0)
  assert.ok(Math.abs(total - expected) < 1e-12)
})

Given(
  'expected-result totals with wins {float} blackjack wins {float} draws {float} and losses {float}',
  (win: number, blackjackWin: number, draw: number, lose: number) => {
    state.totals = {
      win,
      blackjackWin,
      draw,
      lose,
    }
    state.roi = null
  },
)

When('I compute expected-result player ROI', () => {
  assert.ok(state.totals, 'Expected totals to be set')
  state.roi = calculatePlayerRoi(state.totals)
})

Then('regular win probability should be approximately {float}', (expected: number) => {
  assert.ok(state.roi, 'Expected ROI to be computed')
  assert.ok(Math.abs((state.roi?.regularWinProbability ?? 0) - expected) < 1e-12)
})

Then('net ROI should be approximately {float}', (expected: number) => {
  assert.ok(state.roi, 'Expected ROI to be computed')
  assert.ok(Math.abs((state.roi?.netRoi ?? 0) - expected) < 1e-12)
})

Then('return per unit invested should be approximately {float}', (expected: number) => {
  assert.ok(state.roi, 'Expected ROI to be computed')
  assert.ok(Math.abs((state.roi?.returnPerUnit ?? 0) - expected) < 1e-12)
})