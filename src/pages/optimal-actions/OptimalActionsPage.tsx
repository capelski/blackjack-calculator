import { useMemo } from 'react'
import './OptimalActionsPage.css'
import { formatProbability } from '../common/combinationsTreeLogic'
import { compareFinalScores } from '../final-scores/finalScoresLogic'
import { useStandThreshold } from '../stand-threshold/standThresholdContext'
import {
  collectFinalCombinations,
  computeHitOutcomesWithThreshold,
  computeStandOutcomes,
  determineThresholdAction,
  formatScoreLabel,
  groupScores,
  listScoreStates,
  type OutcomeTotals,
} from './optimalActionsLogic'

type ActionRow = {
  action: 'Stand' | 'Hit'
  outcomes: OutcomeTotals
  returnPerUnit: number
}

type ScoreActionGroup = {
  id: string
  score: number
  handType: 'Hard' | 'Soft'
  scoreLabel: string
  rows: ActionRow[]
  optimalAction: 'Stand' | 'Hit'
  conflictsWithThreshold: boolean
}

function formatReturnPerUnit(value: number): string {
  return `${value.toFixed(4)}x`
}

function OptimalActionsPage() {
  const standThreshold = useStandThreshold()
  const dealerScores = useMemo(() => groupScores(collectFinalCombinations(17)), [])

  const scoreActionGroups = useMemo<ScoreActionGroup[]>(() => {
    const states = listScoreStates()

    return states.map((state) => {
      const standOutcomes = computeStandOutcomes(`${state.score}`, dealerScores)
      const hitOutcomes = computeHitOutcomesWithThreshold(state, dealerScores, standThreshold)

      const standReturnPerUnit = 1 + standOutcomes.win - standOutcomes.lose
      const hitReturnPerUnit = 1 + hitOutcomes.win - hitOutcomes.lose
      const optimalAction: 'Stand' | 'Hit' = hitReturnPerUnit > standReturnPerUnit ? 'Hit' : 'Stand'
      const thresholdAction = determineThresholdAction(state.score, standThreshold)
      const conflictsWithThreshold = optimalAction !== thresholdAction

      return {
        id: `${state.handType}-${state.score}`,
        score: state.score,
        handType: state.handType,
        scoreLabel: formatScoreLabel(state.score, state.handType),
        rows: [
          {
            action: 'Stand',
            outcomes: standOutcomes,
            returnPerUnit: standReturnPerUnit,
          },
          {
            action: 'Hit',
            outcomes: hitOutcomes,
            returnPerUnit: hitReturnPerUnit,
          },
        ],
        optimalAction,
        conflictsWithThreshold,
      }
    })
  }, [dealerScores, standThreshold])

  const dealerLabels = useMemo(
    () => [...dealerScores.keys()].sort((left, right) => compareFinalScores(
      { score: left, probability: 0, combinations: [] },
      { score: right, probability: 0, combinations: [] },
    )),
    [dealerScores],
  )

  return (
    <main className="combination-page">
      <header className="combination-header">
        <p className="eyebrow">Blackjack Analyzer</p>
        <h1>Optimal Actions</h1>
        <p className="intro">
          For each player score, compare expected outcomes for standing now versus
          hitting exactly one card and then standing. Hard and soft scores are shown separately.
        </p>
      </header>
      <section className="summary" aria-live="polite">
        <p>Dealer policy: stands on 17</p>
        <p>Dealer final scores: {dealerLabels.join(', ')}</p>
      </section>

      <section className="combination-table optimal-actions-shell" aria-label="Optimal actions table">
        <div className="optimal-actions-scroll">
          <table className="optimal-actions-table">
            <thead>
              <tr>
                <th scope="col">Score</th>
                <th scope="col">Action</th>
                <th scope="col">Win</th>
                <th scope="col">Draw</th>
                <th scope="col">Lose</th>
                <th scope="col">Return / unit</th>
                <th scope="col">Optimal action</th>
              </tr>
            </thead>
            <tbody>
              {scoreActionGroups.flatMap((group) => [
                <tr key={`${group.id}-stand`}>
                  <th scope="row" rowSpan={2} className="state-cell score-cell">{group.scoreLabel}</th>
                  <td className="action-cell stand">Stand</td>
                  <td>{formatProbability(group.rows[0].outcomes.win)}</td>
                  <td>{formatProbability(group.rows[0].outcomes.draw)}</td>
                  <td>{formatProbability(group.rows[0].outcomes.lose)}</td>
                  <td className="roi-cell">{formatReturnPerUnit(group.rows[0].returnPerUnit)}</td>
                  <td rowSpan={2} className={`optimal-action-cell ${group.conflictsWithThreshold ? 'conflict' : ''}`}>
                    {group.optimalAction}
                    {group.conflictsWithThreshold && <span className="conflict-warning" aria-label="Conflicts with threshold">⚠</span>}
                  </td>
                </tr>,
                <tr key={`${group.id}-hit`}>
                  <td className="action-cell hit">Hit</td>
                  <td>{formatProbability(group.rows[1].outcomes.win)}</td>
                  <td>{formatProbability(group.rows[1].outcomes.draw)}</td>
                  <td>{formatProbability(group.rows[1].outcomes.lose)}</td>
                  <td className="roi-cell">{formatReturnPerUnit(group.rows[1].returnPerUnit)}</td>
                </tr>,
              ])}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}

export default OptimalActionsPage
