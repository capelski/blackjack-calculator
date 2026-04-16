import assert from 'node:assert/strict'
import { Given, Then, When } from '@cucumber/cucumber'

import {
  calculateOutcomeTotals,
  type Outcome,
  type OutcomeTotals,
  outcomeClass,
} from './expectedResultsLogic.ts'

type ExpectedResultsWorldState = {
  playerScores: Map<string, number>
  dealerScores: Map<string, number>
  outcome: Outcome | null
  totals: OutcomeTotals | null
}

const state: ExpectedResultsWorldState = {
  playerScores: new Map(),
  dealerScores: new Map(),
  outcome: null,
  totals: null,
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
})

Given('dealer expected-result probabilities {string}', (raw: string) => {
  state.dealerScores = parseProbabilityMap(raw)
  state.totals = null
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

Then('expected-result ROI should be approximately {float}', (expected: number) => {
  assert.ok(state.totals, 'Expected totals to be computed')
  assert.ok(Math.abs((state.totals?.roi ?? 0) - expected) < 1e-12)
})

Then('expected-result return per unit invested should be approximately {float}', (expected: number) => {
  assert.ok(state.totals, 'Expected totals to be computed')
  assert.ok(Math.abs(1 + (state.totals?.roi ?? 0) - expected) < 1e-12)
})