import assert from 'node:assert/strict'
import { Given, Then, When } from '@cucumber/cucumber'

import {
  collectFinalCombinations,
  computeHitOutcomesWithThreshold,
  computeStandOutcomes,
  determineThresholdAction,
  groupScores,
  type OutcomeTotals,
} from './optimalActionsLogic.ts'
import {
  createDealerScoresForStandardRules,
  createRecursiveDecisionModel,
} from '../recursive-decisions/recursiveDecisionsLogic.ts'

type ActionComparison = {
  standOutcomes: OutcomeTotals
  hitOutcomes: OutcomeTotals
  doubleOutcomes: OutcomeTotals | null
  standReturnPerUnit: number
  hitReturnPerUnit: number
  doubleReturnPerUnit: number | null
  optimalAction: 'Stand' | 'Hit' | 'Double'
}

type OptimalActionsWorldState = {
  dealerScores: Map<string, number>
  actionComparison: ActionComparison | null
}

const state: OptimalActionsWorldState = {
  dealerScores: new Map(),
  actionComparison: null,
}

function normalizeScore(score: number): string {
  return score > 21 ? '22+' : score === 21 && score >= 4 ? (score === 21 ? '21' : 'Blackjack') : `${score}`
}

Given('optimal-actions standard dealer probabilities from threshold {int}', (dealerThreshold: number) => {
  const dealerCombinations = collectFinalCombinations(dealerThreshold)
  state.dealerScores = groupScores(dealerCombinations)
})

When(
  'I compute optimal-actions outcomes for score {int} hand type {string} with threshold {int}',
  (score: number, handType: 'Hard' | 'Soft', playerThreshold: number) => {
    const playerScore = normalizeScore(score)
    const standOutcomes = computeStandOutcomes(playerScore, state.dealerScores)
    const hitOutcomes = computeHitOutcomesWithThreshold(
      {
        score,
        handType,
        isSoft: handType === 'Soft',
      },
      state.dealerScores,
      playerThreshold,
    )

    const standReturnPerUnit = 1 + standOutcomes.win - standOutcomes.lose
    const hitReturnPerUnit = 1 + hitOutcomes.win - hitOutcomes.lose
    const optimalAction: 'Stand' | 'Hit' | 'Double' = hitReturnPerUnit > standReturnPerUnit ? 'Hit' : 'Stand'

    state.actionComparison = {
      standOutcomes,
      hitOutcomes,
      doubleOutcomes: null,
      standReturnPerUnit,
      hitReturnPerUnit,
      doubleReturnPerUnit: null,
      optimalAction,
    }
  },
)

When(
  'I compute optimal-actions recursive outcomes for score {int} hand type {string} with doubling enabled',
  (score: number, handType: 'Hard' | 'Soft') => {
    const model = createRecursiveDecisionModel(createDealerScoresForStandardRules(), true)
    const evaluation = model.evaluateState({
      score,
      handType,
      isSoft: handType === 'Soft',
    })

    state.actionComparison = {
      standOutcomes: evaluation.standOutcomes,
      hitOutcomes: evaluation.hitOutcomes,
      doubleOutcomes: evaluation.doubleOutcomes,
      standReturnPerUnit: evaluation.standReturnPerUnit,
      hitReturnPerUnit: evaluation.hitReturnPerUnit,
      doubleReturnPerUnit: evaluation.doubleReturnPerUnit,
      optimalAction: evaluation.action,
    }
  },
)

Then('the optimal-actions stand return per unit should be greater than the hit return per unit', () => {
  assert.ok(state.actionComparison, 'Expected action comparison to be computed')
  assert.ok(
    state.actionComparison.standReturnPerUnit > state.actionComparison.hitReturnPerUnit,
    `Expected stand ${state.actionComparison.standReturnPerUnit} > hit ${state.actionComparison.hitReturnPerUnit}`,
  )
})

Then('the optimal-actions stand return per unit should be less than the hit return per unit', () => {
  assert.ok(state.actionComparison, 'Expected action comparison to be computed')
  assert.ok(
    state.actionComparison.standReturnPerUnit < state.actionComparison.hitReturnPerUnit,
    `Expected stand ${state.actionComparison.standReturnPerUnit} < hit ${state.actionComparison.hitReturnPerUnit}`,
  )
})

Then('the optimal-actions action with highest return should be {string}', (expectedAction: 'Stand' | 'Hit' | 'Double') => {
  assert.ok(state.actionComparison, 'Expected action comparison to be computed')
  assert.equal(state.actionComparison.optimalAction, expectedAction)
})

Then('the optimal-actions stand win probability should be approximately {float}', (expected: number) => {
  assert.ok(state.actionComparison, 'Expected action comparison to be computed')
  const actual = state.actionComparison.standOutcomes.win
  assert.ok(Math.abs(actual - expected) < 1e-2, `Expected ${expected} ± 0.01, got ${actual}`)
})

Then('the optimal-actions hit win probability should be greater than {int}', (threshold: number) => {
  assert.ok(state.actionComparison, 'Expected action comparison to be computed')
  assert.ok(state.actionComparison.hitOutcomes.win > threshold)
})

Then('the optimal-actions hit lose probability should be less than {int}', (threshold: number) => {
  assert.ok(state.actionComparison, 'Expected action comparison to be computed')
  assert.ok(state.actionComparison.hitOutcomes.lose < threshold)
})

Then('the optimal-actions threshold action for score {int} and threshold {int} should be {string}', (score: number, threshold: number, expectedAction: 'Stand' | 'Hit') => {
  const action = determineThresholdAction(score, threshold)
  assert.equal(action, expectedAction)
})

Then('the optimal-actions stand return per unit should be approximately {float}', (expected: number) => {
  assert.ok(state.actionComparison, 'Expected action comparison to be computed')
  const actual = state.actionComparison.standReturnPerUnit
  assert.ok(
    Math.abs(actual - expected) < 1e-4,
    `Expected stand ROI approximately ${expected}, got ${actual}`,
  )
})

Then('the optimal-actions hit return per unit should be approximately {float}', (expected: number) => {
  assert.ok(state.actionComparison, 'Expected action comparison to be computed')
  const actual = state.actionComparison.hitReturnPerUnit
  assert.ok(
    Math.abs(actual - expected) < 1e-4,
    `Expected hit ROI approximately ${expected}, got ${actual}`,
  )
})

Then('the optimal-actions double return per unit should be approximately {float}', (expected: number) => {
  assert.ok(state.actionComparison, 'Expected action comparison to be computed')
  const actual = state.actionComparison.doubleReturnPerUnit
  assert.notEqual(actual, null, 'Expected double return per unit to be available')
  assert.ok(
    Math.abs((actual ?? 0) - expected) < 1e-4,
    `Expected double ROI approximately ${expected}, got ${actual}`,
  )
})

Then('the optimal-actions double return per unit should be greater than the hit return per unit', () => {
  assert.ok(state.actionComparison, 'Expected action comparison to be computed')
  const doubleReturn = state.actionComparison.doubleReturnPerUnit
  assert.notEqual(doubleReturn, null, 'Expected double return per unit to be available')
  assert.ok(
    (doubleReturn ?? Number.NEGATIVE_INFINITY) > state.actionComparison.hitReturnPerUnit,
    `Expected double ${doubleReturn} > hit ${state.actionComparison.hitReturnPerUnit}`,
  )
})
