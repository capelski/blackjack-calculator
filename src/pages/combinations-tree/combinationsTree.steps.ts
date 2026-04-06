import assert from 'node:assert/strict'
import { Given, Then, When } from '@cucumber/cucumber'

import {
  type CombinationItem,
  createTreeNavigator,
  formatProbability,
  parseSequenceQuery,
} from '../common/combinationsTreeLogic.ts'

type WorldState = {
  navigator: ReturnType<typeof createTreeNavigator> | null
  parsedTokens: string[] | null
  formattedProbability: string | null
  totalCombinations: number | null
  pageItems: CombinationItem[]
}

const state: WorldState = {
  navigator: null,
  parsedTokens: null,
  formattedProbability: null,
  totalCombinations: null,
  pageItems: [],
}

Given('a tree navigator with threshold {int} and sequence {string}', (threshold: number, sequence: string) => {
  state.navigator = createTreeNavigator(threshold, parseSequenceQuery(sequence))
  state.totalCombinations = null
  state.pageItems = []
})

When('I parse the sequence query {string}', (query: string) => {
  state.parsedTokens = parseSequenceQuery(query)
})

Then('the parsed tokens should be {string}', (expectedCsv: string) => {
  const expected = expectedCsv.length > 0 ? expectedCsv.split(',') : []
  assert.deepEqual(state.parsedTokens, expected)
})

When('I format the probability value {float}', (probability: number) => {
  state.formattedProbability = formatProbability(probability)
})

Then('the formatted probability should be {string}', (expected: string) => {
  assert.equal(state.formattedProbability, expected)
})

When('I ask for the total combinations with final hands only', () => {
  assert.ok(state.navigator, 'Expected navigator to be initialized')
  state.totalCombinations = state.navigator.getTotalCombinations(true)
})

When('I ask for the total combinations including non-final hands', () => {
  assert.ok(state.navigator, 'Expected navigator to be initialized')
  state.totalCombinations = state.navigator.getTotalCombinations(false)
})

Then('the total combinations should be {int}', (expected: number) => {
  assert.equal(state.totalCombinations, expected)
})

When(
  'I request page {int} with page size {int} for final hands only',
  (pageIndex: number, pageSize: number) => {
    assert.ok(state.navigator, 'Expected navigator to be initialized')
    state.pageItems = state.navigator.getPage(pageIndex, pageSize, true)
  },
)

Then('the page should contain {int} combinations', (expectedCount: number) => {
  assert.equal(state.pageItems.length, expectedCount)
})

Then(
  'the first combination should have score {string} cards {string} and action {string}',
  (expectedScore: string, expectedCards: string, expectedAction: string) => {
    const first = state.pageItems[0]
    assert.ok(first, 'Expected at least one page item')
    assert.equal(first.score, expectedScore)
    assert.equal(first.cards, expectedCards)
    assert.equal(first.action, expectedAction)
  },
)

Then('the first combination probability should be approximately {float}', (expectedProbability: number) => {
  const first = state.pageItems[0]
  assert.ok(first, 'Expected at least one page item')
  const delta = Math.abs(first.probability - expectedProbability)
  assert.ok(delta < 1e-12, `Expected probability within tolerance, got delta ${delta}`)
})

Then('the third combination should have cards {string}', (expectedCards: string) => {
  const third = state.pageItems[2]
  assert.ok(third, 'Expected at least three page items')
  assert.equal(third.cards, expectedCards)
})

Then(
  'the {int}th combination should have score {string} cards {string} and action {string}',
  (ordinal: number, expectedScore: string, expectedCards: string, expectedAction: string) => {
    const index = ordinal - 1
    const item = state.pageItems[index]
    assert.ok(item, `Expected page item at position ${ordinal}`)
    assert.equal(item.score, expectedScore)
    assert.equal(item.cards, expectedCards)
    assert.equal(item.action, expectedAction)
  },
)
