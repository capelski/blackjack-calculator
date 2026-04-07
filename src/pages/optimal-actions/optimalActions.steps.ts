import assert from 'node:assert/strict'
import { Given, Then, When } from '@cucumber/cucumber'

import type { CombinationItem } from '../common/combinationsTreeLogic.ts'
import {
  computeHitOutcomesWithThreshold,
  computeHitTransition,
  determineThresholdAction,
  groupScores,
  listScoreStates,
  type OutcomeTotals,
  type ScoreState,
} from './optimalActionsLogic.ts'

type OptimalActionsWorldState = {
  combinations: CombinationItem[]
  groupedScores: Map<string, number>
  transition: ReturnType<typeof computeHitTransition> | null
  thresholdAction: 'Stand' | 'Hit' | null
  dealerScores: Map<string, number>
  outcomes: OutcomeTotals | null
  listedStates: ScoreState[]
}

const state: OptimalActionsWorldState = {
  combinations: [],
  groupedScores: new Map(),
  transition: null,
  thresholdAction: null,
  dealerScores: new Map(),
  outcomes: null,
  listedStates: [],
}

function parseScoreProbabilityMap(raw: string): Map<string, number> {
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

Given('optimal-actions combinations {string}', (raw: string) => {
  state.combinations = [...parseScoreProbabilityMap(raw).entries()].map(([score, probability]) => ({
    score,
    cards: '',
    probability,
    action: 'Stand',
  }))
  state.groupedScores = new Map()
})

When('I group optimal-actions scores', () => {
  state.groupedScores = groupScores(state.combinations)
})

Then('grouped score {string} should have probability approximately {float}', (score: string, expected: number) => {
  const actual = state.groupedScores.get(score) ?? 0
  assert.ok(Math.abs(actual - expected) < 1e-12)
})

When(
  'I compute optimal-actions hit transition for score {int} hand type {string} with card value {int}',
  (score: number, handType: 'Hard' | 'Soft', cardValue: number) => {
    state.transition = computeHitTransition({
      score,
      handType,
      isSoft: handType === 'Soft',
    }, cardValue)
  },
)

Then('the optimal-actions transition total should be {int}', (expectedTotal: number) => {
  assert.equal(state.transition?.total, expectedTotal)
})

Then(
  'the optimal-actions transition should be soft {word} and bust {word}',
  (softFlag: string, bustFlag: string) => {
    assert.ok(state.transition, 'Expected transition to be computed')
    assert.equal(state.transition?.isSoft, softFlag === 'true')
    assert.equal(state.transition?.bust, bustFlag === 'true')
  },
)

When('I determine optimal-actions threshold action for score {int} and threshold {int}', (score: number, threshold: number) => {
  state.thresholdAction = determineThresholdAction(score, threshold)
})

Then('the optimal-actions threshold action should be {string}', (expectedAction: 'Stand' | 'Hit') => {
  assert.equal(state.thresholdAction, expectedAction)
})

Given('optimal-actions dealer probabilities {string}', (raw: string) => {
  state.dealerScores = parseScoreProbabilityMap(raw)
})

When(
  'I compute optimal-actions hit outcomes for score {int} hand type {string} with threshold {int}',
  (score: number, handType: 'Hard' | 'Soft', threshold: number) => {
    state.outcomes = computeHitOutcomesWithThreshold(
      {
        score,
        handType,
        isSoft: handType === 'Soft',
      },
      state.dealerScores,
      threshold,
    )
  },
)

Then('optimal-actions win probability should be approximately {float}', (expected: number) => {
  assert.ok(state.outcomes, 'Expected outcomes to be computed')
  assert.ok(Math.abs((state.outcomes?.win ?? 0) - expected) < 1e-12)
})

Then('optimal-actions draw probability should be approximately {float}', (expected: number) => {
  assert.ok(state.outcomes, 'Expected outcomes to be computed')
  assert.ok(Math.abs((state.outcomes?.draw ?? 0) - expected) < 1e-12)
})

Then('optimal-actions lose probability should be approximately {float}', (expected: number) => {
  assert.ok(state.outcomes, 'Expected outcomes to be computed')
  assert.ok(Math.abs((state.outcomes?.lose ?? 0) - expected) < 1e-12)
})

When('I list optimal-actions score states', () => {
  state.listedStates = listScoreStates()
})

Then('optimal-actions score state count should be {int}', (expectedCount: number) => {
  assert.equal(state.listedStates.length, expectedCount)
})

Then('the first optimal-actions state should be score {int} hand type {string}', (score: number, handType: 'Hard' | 'Soft') => {
  const first = state.listedStates[0]
  assert.ok(first, 'Expected at least one state')
  assert.equal(first.score, score)
  assert.equal(first.handType, handType)
})

Then('the last optimal-actions state should be score {int} hand type {string}', (score: number, handType: 'Hard' | 'Soft') => {
  const last = state.listedStates[state.listedStates.length - 1]
  assert.ok(last, 'Expected at least one state')
  assert.equal(last.score, score)
  assert.equal(last.handType, handType)
})
