export type BlackjackCard = {
  label: string
  values: number[]
  probability: number
}

export type CombinationAction = 'Stand' | 'Bust' | 'Hit'

export type CombinationItem = {
  score: string
  cards: string
  probability: number
  action: CombinationAction
}

export type TreeNavigator = {
  getTotalCombinations: (finalHandsOnly: boolean) => number
  getPage: (pageIndex: number, pageSize: number, finalHandsOnly: boolean) => CombinationItem[]
}

export const PAGE_SIZE = 150

const CARD_OPTIONS = [
  { label: 'A', values: [1, 11], probability: 1 / 13 },
  { label: '2', values: [2], probability: 1 / 13 },
  { label: '3', values: [3], probability: 1 / 13 },
  { label: '4', values: [4], probability: 1 / 13 },
  { label: '5', values: [5], probability: 1 / 13 },
  { label: '6', values: [6], probability: 1 / 13 },
  { label: '7', values: [7], probability: 1 / 13 },
  { label: '8', values: [8], probability: 1 / 13 },
  { label: '9', values: [9], probability: 1 / 13 },
  { label: '10', values: [10], probability: 4 / 13 },
] as const satisfies readonly BlackjackCard[]

export function parseSequenceQuery(query: string): string[] {
  return query
    .toUpperCase()
    .split(/[^A-Z0-9]+/)
    .filter(Boolean)
    .map((token) => (token === 'T' ? '10' : token))
}

function buildPrefixTable(pattern: string[]): number[] {
  const lps = new Array<number>(pattern.length).fill(0)
  let len = 0
  let i = 1

  while (i < pattern.length) {
    if (pattern[i] === pattern[len]) {
      len += 1
      lps[i] = len
      i += 1
      continue
    }

    if (len > 0) {
      len = lps[len - 1]
      continue
    }

    lps[i] = 0
    i += 1
  }

  return lps
}

function normalizeTotals(totals: number[]): number[] {
  return [...new Set(totals)].sort((a, b) => a - b)
}

function nextTotals(totals: number[], cardValues: number[]): number[] {
  const produced: number[] = []

  for (const current of totals) {
    for (const nextValue of cardValues) {
      produced.push(current + nextValue)
    }
  }

  return normalizeTotals(produced)
}

function bestScore(totals: number[]): number {
  const underOrEqual = totals.filter((score) => score <= 21)

  if (underOrEqual.length > 0) {
    return Math.max(...underOrEqual)
  }

  return Math.min(...totals)
}

function isBlackjack(cardCount: number, totals: number[]): boolean {
  return cardCount === 2 && bestScore(totals) === 21
}

function scoreLabel(totals: number[], cardCount: number): string {
  if (isBlackjack(cardCount, totals)) {
    return 'Blackjack'
  }

  const underOrEqual = totals.filter((score) => score <= 21)

  if (underOrEqual.length === 0) {
    return '22+'
  }

  if (underOrEqual.length === 1) {
    return `${underOrEqual[0]}`
  }

  return `${Math.max(...underOrEqual)} (soft ${Math.min(...underOrEqual)})`
}

export function formatProbability(probability: number): string {
  const percentage = probability * 100

  if (percentage >= 0.01) {
    return `${percentage.toFixed(4)}%`
  }

  return `${percentage.toExponential(2)}%`
}

export function createTreeNavigator(threshold: number, sequenceTokens: string[]): TreeNavigator {
  const countMemo = new Map<string, number>()
  const prefixTable = buildPrefixTable(sequenceTokens)

  const advanceMatch = (matchState: number, cardLabel: string): { state: number; matched: boolean } => {
    if (sequenceTokens.length === 0) {
      return { state: 0, matched: true }
    }

    let nextState = matchState

    while (nextState > 0 && sequenceTokens[nextState] !== cardLabel) {
      nextState = prefixTable[nextState - 1]
    }

    if (sequenceTokens[nextState] === cardLabel) {
      nextState += 1
    }

    if (nextState === sequenceTokens.length) {
      return { state: prefixTable[nextState - 1] ?? 0, matched: true }
    }

    return { state: nextState, matched: false }
  }

  const countFromTotals = (
    totals: number[],
    cardCount: number,
    finalHandsOnly: boolean,
    matchState: number,
    hasMatched: boolean,
  ): number => {
    const key = `${finalHandsOnly ? 'final' : 'all'}:${cardCount}:${matchState}:${hasMatched ? 1 : 0}:${normalizeTotals(totals).join(',')}`

    if (countMemo.has(key)) {
      return countMemo.get(key) ?? 0
    }

    const score = bestScore(totals)
    const canStand = cardCount >= 2
    const hasBlackjack = isBlackjack(cardCount, totals)
    const isTerminal = hasBlackjack || score > 21 || (canStand && score >= threshold)

    if (isTerminal) {
      const terminalCount = hasMatched ? 1 : 0
      countMemo.set(key, terminalCount)
      return terminalCount
    }

    let total = finalHandsOnly ? 0 : hasMatched ? 1 : 0

    for (const card of CARD_OPTIONS) {
      const transition = advanceMatch(matchState, card.label)
      total += countFromTotals(
        nextTotals(totals, card.values),
        cardCount + 1,
        finalHandsOnly,
        transition.state,
        hasMatched || transition.matched,
      )
    }

    countMemo.set(key, total)
    return total
  }

  const getPage = (pageIndex: number, pageSize: number, finalHandsOnly: boolean): CombinationItem[] => {
    let skip = pageIndex * pageSize
    const items: CombinationItem[] = []

    const walk = (totals: number[], cards: string[], probability: number, matchState: number, hasMatched: boolean): void => {
      const score = bestScore(totals)
      const hasBlackjack = isBlackjack(cards.length, totals)
      const isTerminal = hasBlackjack || score > 21 || (cards.length >= 2 && score >= threshold)
      const shouldIncludeCurrent = cards.length > 0 && (!finalHandsOnly || isTerminal)

      if (shouldIncludeCurrent && hasMatched) {
        if (skip > 0) {
          skip -= 1
        } else if (items.length < pageSize) {
          items.push({
            score: scoreLabel(totals, cards.length),
            cards: cards.join(', '),
            probability,
            action: isTerminal ? (score > 21 ? 'Bust' : 'Stand') : 'Hit',
          })
        }
      }

      if (isTerminal) {
        return
      }

      for (const card of CARD_OPTIONS) {
        const next = nextTotals(totals, card.values)
        const transition = advanceMatch(matchState, card.label)
        const nextHasMatched = hasMatched || transition.matched
        const branchCount = countFromTotals(next, cards.length + 1, finalHandsOnly, transition.state, nextHasMatched)

        if (skip >= branchCount) {
          skip -= branchCount
          continue
        }

        if (items.length >= pageSize) {
          return
        }

        walk(next, [...cards, card.label], probability * card.probability, transition.state, nextHasMatched)

        if (items.length >= pageSize) {
          return
        }
      }
    }

    walk([0], [], 1, 0, sequenceTokens.length === 0)
    return items
  }

  return {
    getTotalCombinations: (finalHandsOnly: boolean) =>
      countFromTotals([0], 0, finalHandsOnly, 0, sequenceTokens.length === 0),
    getPage,
  }
}
