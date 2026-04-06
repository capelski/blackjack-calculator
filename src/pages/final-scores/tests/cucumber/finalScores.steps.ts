import assert from 'node:assert/strict'
import { Given, Then, When } from '@cucumber/cucumber'

import {
  compareFinalScores,
  normalizedFinalScore,
  type FinalScoreGroup,
} from '../../finalScoresLogic.ts'

type FinalScoresWorldState = {
  normalizedScore: string | null
  groups: FinalScoreGroup[]
  sortedGroups: FinalScoreGroup[]
  compareResult: number | null
}

const state: FinalScoresWorldState = {
  normalizedScore: null,
  groups: [],
  sortedGroups: [],
  compareResult: null,
}

When('I normalize final score label {string}', (score: string) => {
  state.normalizedScore = normalizedFinalScore(score)
})

Then('the normalized final score label should be {string}', (expected: string) => {
  assert.equal(state.normalizedScore, expected)
})

Given('final score groups with labels {string}', (labelsCsv: string) => {
  state.groups = labelsCsv
    .split(',')
    .filter((label) => label.length > 0)
    .map((label) => ({
      score: label,
      probability: 0,
      combinations: [],
    }))
  state.sortedGroups = []
})

When('I sort final score groups', () => {
  state.sortedGroups = [...state.groups].sort(compareFinalScores)
})

Then('the sorted final score labels should be {string}', (expectedCsv: string) => {
  const actual = state.sortedGroups.map((group) => group.score).join(',')
  assert.equal(actual, expectedCsv)
})

When('I compare final score groups {string} and {string}', (left: string, right: string) => {
  state.compareResult = compareFinalScores(
    { score: left, probability: 0, combinations: [] },
    { score: right, probability: 0, combinations: [] },
  )
})

Then('the compare result should be greater than 0', () => {
  assert.notEqual(state.compareResult, null)
  assert.ok((state.compareResult ?? 0) > 0)
})

Then('the compare result should be less than 0', () => {
  assert.notEqual(state.compareResult, null)
  assert.ok((state.compareResult ?? 0) < 0)
})