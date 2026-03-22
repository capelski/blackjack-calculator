import { useEffect, useMemo, useState } from 'react'
import './CombinationsTreePage.css'

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
]

const PAGE_SIZE = 150

function normalizeTotals(totals) {
  return [...new Set(totals)].sort((a, b) => a - b)
}

function nextTotals(totals, cardValues) {
  const produced = []

  for (const current of totals) {
    for (const nextValue of cardValues) {
      produced.push(current + nextValue)
    }
  }

  return normalizeTotals(produced)
}

function bestScore(totals) {
  const underOrEqual = totals.filter((score) => score <= 21)

  if (underOrEqual.length > 0) {
    return Math.max(...underOrEqual)
  }

  return Math.min(...totals)
}

function scoreLabel(totals) {
  const underOrEqual = totals.filter((score) => score <= 21)

  if (underOrEqual.length === 0) {
    return `${Math.min(...totals)} (bust)`
  }

  if (underOrEqual.length === 1) {
    return `${underOrEqual[0]}`
  }

  return `${Math.max(...underOrEqual)} (soft ${Math.min(...underOrEqual)})`
}

function formatProbability(probability) {
  const percentage = probability * 100

  if (percentage >= 0.01) {
    return `${percentage.toFixed(4)}%`
  }

  return `${percentage.toExponential(2)}%`
}

function createTreeNavigator(threshold) {
  const countMemo = new Map()

  const countFromTotals = (totals) => {
    const key = normalizeTotals(totals).join(',')

    if (countMemo.has(key)) {
      return countMemo.get(key)
    }

    const score = bestScore(totals)

    if (score >= threshold || score > 21) {
      countMemo.set(key, 1)
      return 1
    }

    let total = 0

    for (const card of CARD_OPTIONS) {
      total += countFromTotals(nextTotals(totals, card.values))
    }

    countMemo.set(key, total)
    return total
  }

  const getPage = (pageIndex, pageSize) => {
    let skip = pageIndex * pageSize
    const items = []

    const walk = (totals, cards, probability) => {
      const score = bestScore(totals)
      const isTerminal = score >= threshold || score > 21

      if (isTerminal) {
        if (skip > 0) {
          skip -= 1
          return
        }

        if (items.length < pageSize) {
          items.push({
            score: scoreLabel(totals),
            cards: cards.join(', '),
            probability,
            action: score > 21 ? 'Bust' : 'Stand',
          })
        }

        return
      }

      for (const card of CARD_OPTIONS) {
        const next = nextTotals(totals, card.values)
        const branchCount = countFromTotals(next)

        if (skip >= branchCount) {
          skip -= branchCount
          continue
        }

        if (items.length >= pageSize) {
          return
        }

        walk(next, [...cards, card.label], probability * card.probability)

        if (items.length >= pageSize) {
          return
        }
      }
    }

    walk([0], [], 1)
    return items
  }

  return {
    getTotalCombinations: () => countFromTotals([0]),
    getPage,
  }
}

function CombinationsTreePage() {
  const [standThreshold, setStandThreshold] = useState(17)
  const [page, setPage] = useState(0)

  const treeNavigator = useMemo(() => createTreeNavigator(standThreshold), [standThreshold])

  const totalCombinations = useMemo(
    () => treeNavigator.getTotalCombinations(),
    [treeNavigator],
  )

  const totalPages = Math.max(1, Math.ceil(totalCombinations / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)

  const combinations = useMemo(
    () => treeNavigator.getPage(safePage, PAGE_SIZE),
    [safePage, treeNavigator],
  )

  useEffect(() => {
    setPage(0)
  }, [standThreshold])

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

      <ul className="combination-list" aria-label="Blackjack hand combinations">
        {combinations.map((combination, index) => (
          <li key={`${safePage}-${index}`} className="combination-item">
            <p>
              <strong>Hand score:</strong> {combination.score}
            </p>
            <p>
              <strong>Cards:</strong> {combination.cards}
            </p>
            <p>
              <strong>Probability:</strong> {formatProbability(combination.probability)}
            </p>
            <p>
              <strong>Action:</strong> {combination.action}
            </p>
          </li>
        ))}
      </ul>
    </main>
  )
}

export default CombinationsTreePage
