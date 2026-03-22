import { useEffect, useMemo, useState } from 'react'
import './CombinationsTreePage.css'

type BlackjackCard = {
  label: string
  values: number[]
  probability: number
}

type CombinationAction = 'Stand' | 'Bust' | 'Hit'

type CombinationItem = {
  score: string
  cards: string
  probability: number
  action: CombinationAction
}

type TreeNavigator = {
  getTotalCombinations: (finalHandsOnly: boolean) => number
  getPage: (pageIndex: number, pageSize: number, finalHandsOnly: boolean) => CombinationItem[]
}

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

const PAGE_SIZE = 150

function parseSequenceQuery(query: string): string[] {
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

function scoreLabel(totals: number[]): string {
  const underOrEqual = totals.filter((score) => score <= 21)

  if (underOrEqual.length === 0) {
    return `${Math.min(...totals)} (bust)`
  }

  if (underOrEqual.length === 1) {
    return `${underOrEqual[0]}`
  }

  return `${Math.max(...underOrEqual)} (soft ${Math.min(...underOrEqual)})`
}

function formatProbability(probability: number): string {
  const percentage = probability * 100

  if (percentage >= 0.01) {
    return `${percentage.toFixed(4)}%`
  }

  return `${percentage.toExponential(2)}%`
}

function createTreeNavigator(threshold: number, sequenceTokens: string[]): TreeNavigator {
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
    const isTerminal = score > 21 || (canStand && score >= threshold)

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
      const isTerminal = score > 21 || (cards.length >= 2 && score >= threshold)
      const shouldIncludeCurrent = cards.length > 0 && (!finalHandsOnly || isTerminal)

      if (shouldIncludeCurrent && hasMatched) {
        if (skip > 0) {
          skip -= 1
        } else if (items.length < pageSize) {
          items.push({
            score: scoreLabel(totals),
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

function CombinationsTreePage() {
  const [standThreshold, setStandThreshold] = useState<number>(17)
  const [finalHandsOnly, setFinalHandsOnly] = useState<boolean>(true)
  const [sequenceQuery, setSequenceQuery] = useState<string>('')
  const [page, setPage] = useState<number>(0)

  const sequenceTokens = useMemo(() => parseSequenceQuery(sequenceQuery), [sequenceQuery])
  const sequenceKey = useMemo(() => sequenceTokens.join('|'), [sequenceTokens])

  const treeNavigator = useMemo(
    () => createTreeNavigator(standThreshold, sequenceTokens),
    [sequenceKey, standThreshold],
  )

  const totalCombinations = useMemo(
    () => treeNavigator.getTotalCombinations(finalHandsOnly),
    [finalHandsOnly, treeNavigator],
  )

  const totalPages = Math.max(1, Math.ceil(totalCombinations / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)

  const combinations = useMemo(
    () => treeNavigator.getPage(safePage, PAGE_SIZE, finalHandsOnly),
    [finalHandsOnly, safePage, treeNavigator],
  )

  useEffect(() => {
    setPage(0)
  }, [finalHandsOnly, sequenceKey, standThreshold])

  return (
    <main className="combination-page">
      <header className="combination-header">
        <p className="eyebrow">Blackjack Analyzer</p>
        <h1>Combinations Tree</h1>
        <p className="intro">
          Terminal player hands generated from a recursive card tree. The player keeps
          hitting until the hand score reaches the stand threshold or busts.
        </p>
      </header>

      <section className="controls" aria-label="Stand threshold controls">
        <label htmlFor="threshold-slider">Stand threshold: {standThreshold}</label>
        <input
          id="threshold-slider"
          type="range"
          min="4"
          max="20"
          step="1"
          value={standThreshold}
          onChange={(event) => setStandThreshold(Number(event.target.value))}
        />

        <label className="checkbox-row" htmlFor="final-hands-only">
          <input
            id="final-hands-only"
            type="checkbox"
            checked={finalHandsOnly}
            onChange={(event) => setFinalHandsOnly(event.target.checked)}
          />
          Final hands only
        </label>

        <label className="search-row" htmlFor="sequence-search">
          Card sequence filter
        </label>
        <input
          id="sequence-search"
          type="search"
          value={sequenceQuery}
          onChange={(event) => setSequenceQuery(event.target.value)}
          placeholder="Example: A 10 or 5, 6, 7"
        />
      </section>

      <section className="summary" aria-live="polite">
        <p>Total combinations: {totalCombinations.toLocaleString()}</p>
        <p>
          Showing {safePage * PAGE_SIZE + 1}-{Math.min((safePage + 1) * PAGE_SIZE, totalCombinations)}
        </p>
      </section>

      <section className="pagination" aria-label="Combination pages">
        <button type="button" onClick={() => setPage((current) => Math.max(0, current - 1))} disabled={safePage === 0}>
          Previous
        </button>
        <span>
          Page {safePage + 1} of {totalPages}
        </span>
        <button
          type="button"
          onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
          disabled={safePage >= totalPages - 1}
        >
          Next
        </button>
      </section>

      <section className="combination-table" aria-label="Blackjack hand combinations">
        <div className="combination-table-header" role="row">
          <span role="columnheader">Hand score</span>
          <span role="columnheader">Cards</span>
          <span role="columnheader">Probability</span>
          <span role="columnheader">Action</span>
        </div>

        <ul className="combination-list">
          {combinations.map((combination, index) => (
            <li key={`${safePage}-${index}`} className="combination-row" role="row">
              <span className="cell score" data-label="Hand score" role="cell">
                {combination.score}
              </span>
              <span className="cell cards" data-label="Cards" role="cell">
                {combination.cards}
              </span>
              <span className="cell probability" data-label="Probability" role="cell">
                {formatProbability(combination.probability)}
              </span>
              <span className={`cell action ${combination.action.toLowerCase()}`} data-label="Action" role="cell">
                {combination.action}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}

export default CombinationsTreePage
