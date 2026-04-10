import assert from 'node:assert/strict'
import { Given, Then, When } from '@cucumber/cucumber'

import {
  createDealerScoresForStandardRules,
  createRecursiveDecisionModel,
  type RecursiveDecisionModel,
  type RecursiveEvaluation,
} from './recursiveDecisionsLogic.ts'
import type { ScoreState } from '../optimal-actions/optimalActionsLogic.ts'

type RecursiveDecisionsWorldState = {
  model: RecursiveDecisionModel | null
  evaluation: RecursiveEvaluation | null
}

const state: RecursiveDecisionsWorldState = {
  model: null,
  evaluation: null,
}

const TOLERANCE = 1e-12

Given('recursive-decisions standard dealer probabilities from threshold {int}', (dealerThreshold: number) => {
  assert.equal(dealerThreshold, 17, 'Recursive decisions tests currently assume dealer threshold 17')

  const dealerScores = createDealerScoresForStandardRules()
  state.model = createRecursiveDecisionModel(dealerScores)
  state.evaluation = null
})

When(
  'I evaluate recursive-decisions for score {int} hand type {string}',
  (score: number, handType: 'Hard' | 'Soft') => {
    assert.ok(state.model, 'Expected recursive model to be initialized')

    const scoreState: ScoreState = {
      score,
      handType,
      isSoft: handType === 'Soft',
    }

    state.evaluation = state.model.evaluateState(scoreState)
  },
)

Then('the recursive-decisions action with highest return should be {string}', (expected: 'Stand' | 'Hit') => {
  assert.ok(state.evaluation, 'Expected recursive evaluation to be computed')
  assert.equal(state.evaluation.action, expected)
})

Then('the recursive-decisions stand return per unit should be greater than the hit return per unit', () => {
  assert.ok(state.evaluation, 'Expected recursive evaluation to be computed')
  assert.ok(
    state.evaluation.standReturnPerUnit > state.evaluation.hitReturnPerUnit,
    `Expected stand ${state.evaluation.standReturnPerUnit} > hit ${state.evaluation.hitReturnPerUnit}`,
  )
})

Then('the recursive-decisions hit return per unit should be greater than the stand return per unit', () => {
  assert.ok(state.evaluation, 'Expected recursive evaluation to be computed')
  assert.ok(
    state.evaluation.hitReturnPerUnit > state.evaluation.standReturnPerUnit,
    `Expected hit ${state.evaluation.hitReturnPerUnit} > stand ${state.evaluation.standReturnPerUnit}`,
  )
})

Then('the recursive-decisions stand win probability should be approximately {float}', (expected: number) => {
  assert.ok(state.evaluation, 'Expected recursive evaluation to be computed')
  assert.ok(
    Math.abs(state.evaluation.standOutcomes.win - expected) < TOLERANCE,
    `Expected stand win probability ${expected}, got ${state.evaluation.standOutcomes.win}`,
  )
})

Then('the recursive-decisions stand draw probability should be approximately {float}', (expected: number) => {
  assert.ok(state.evaluation, 'Expected recursive evaluation to be computed')
  assert.ok(
    Math.abs(state.evaluation.standOutcomes.draw - expected) < TOLERANCE,
    `Expected stand draw probability ${expected}, got ${state.evaluation.standOutcomes.draw}`,
  )
})

Then('the recursive-decisions stand lose probability should be approximately {float}', (expected: number) => {
  assert.ok(state.evaluation, 'Expected recursive evaluation to be computed')
  assert.ok(
    Math.abs(state.evaluation.standOutcomes.lose - expected) < TOLERANCE,
    `Expected stand lose probability ${expected}, got ${state.evaluation.standOutcomes.lose}`,
  )
})

Then('the recursive-decisions stand return per unit should be approximately {float}', (expected: number) => {
  assert.ok(state.evaluation, 'Expected recursive evaluation to be computed')
  assert.ok(
    Math.abs(state.evaluation.standReturnPerUnit - expected) < TOLERANCE,
    `Expected stand return per unit ${expected}, got ${state.evaluation.standReturnPerUnit}`,
  )
})

Then('the recursive-decisions hit win probability should be approximately {float}', (expected: number) => {
  assert.ok(state.evaluation, 'Expected recursive evaluation to be computed')
  assert.ok(
    Math.abs(state.evaluation.hitOutcomes.win - expected) < TOLERANCE,
    `Expected hit win probability ${expected}, got ${state.evaluation.hitOutcomes.win}`,
  )
})

Then('the recursive-decisions hit draw probability should be approximately {float}', (expected: number) => {
  assert.ok(state.evaluation, 'Expected recursive evaluation to be computed')
  assert.ok(
    Math.abs(state.evaluation.hitOutcomes.draw - expected) < TOLERANCE,
    `Expected hit draw probability ${expected}, got ${state.evaluation.hitOutcomes.draw}`,
  )
})

Then('the recursive-decisions hit lose probability should be approximately {float}', (expected: number) => {
  assert.ok(state.evaluation, 'Expected recursive evaluation to be computed')
  assert.ok(
    Math.abs(state.evaluation.hitOutcomes.lose - expected) < TOLERANCE,
    `Expected hit lose probability ${expected}, got ${state.evaluation.hitOutcomes.lose}`,
  )
})

Then('the recursive-decisions hit return per unit should be approximately {float}', (expected: number) => {
  assert.ok(state.evaluation, 'Expected recursive evaluation to be computed')
  assert.ok(
    Math.abs(state.evaluation.hitReturnPerUnit - expected) < TOLERANCE,
    `Expected hit return per unit ${expected}, got ${state.evaluation.hitReturnPerUnit}`,
  )
})

Then('the recursive-decisions stand ROI should match win-loss formula', () => {
  assert.ok(state.evaluation, 'Expected recursive evaluation to be computed')

  const expected = 1 + state.evaluation.standOutcomes.win - state.evaluation.standOutcomes.lose
  assert.ok(
    Math.abs(state.evaluation.standReturnPerUnit - expected) < TOLERANCE,
    `Expected stand ROI ${expected}, got ${state.evaluation.standReturnPerUnit}`,
  )
})

Then('the recursive-decisions hit ROI should match win-loss formula', () => {
  assert.ok(state.evaluation, 'Expected recursive evaluation to be computed')

  const expected = 1 + state.evaluation.hitOutcomes.win - state.evaluation.hitOutcomes.lose
  assert.ok(
    Math.abs(state.evaluation.hitReturnPerUnit - expected) < TOLERANCE,
    `Expected hit ROI ${expected}, got ${state.evaluation.hitReturnPerUnit}`,
  )
})

Then('the recursive-decisions best return per unit should equal the selected action return', () => {
  assert.ok(state.evaluation, 'Expected recursive evaluation to be computed')

  const selectedRoi = state.evaluation.action === 'Stand'
    ? state.evaluation.standReturnPerUnit
    : state.evaluation.hitReturnPerUnit

  assert.ok(
    Math.abs(state.evaluation.bestReturnPerUnit - selectedRoi) < TOLERANCE,
    `Expected best return ${state.evaluation.bestReturnPerUnit} to equal selected action return ${selectedRoi}`,
  )
})
