import { useMemo } from 'react'
import './OptimalActionsPage.css'
import { formatProbability } from '../common/combinationsTreeLogic'
import { useDecisionPolicyContext } from '../common/decisionPolicyContext'
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
  scoreLabel: string
  rows: ActionRow[]
  optimalAction: 'Stand' | 'Hit'
  conflictsWithThreshold: boolean
}

function formatReturnPerUnit(value: number): string {
  return `${value.toFixed(4)}x`
}

function OptimalActionsPage() {
  const { mode, standThreshold, recursiveDecisionModel } = useDecisionPolicyContext()
  const dealerScores = useMemo(() => groupScores(collectFinalCombinations(17)), [])

  const scoreActionGroups = useMemo<ScoreActionGroup[]>(() => {
    const states = listScoreStates()

    return states.map((state) => {
      const standOutcomes = computeStandOutcomes(`${state.score}`, dealerScores)
      const standReturnPerUnit = 1 + standOutcomes.win - standOutcomes.lose

      const thresholdHitOutcomes = computeHitOutcomesWithThreshold(
        state,
        dealerScores,
        standThreshold ?? 17,
      )
      const thresholdHitReturnPerUnit = 1 + thresholdHitOutcomes.win - thresholdHitOutcomes.lose

      const recursiveEvaluation = recursiveDecisionModel?.evaluateState(state) ?? null

      const hitOutcomes = mode === 'recursive-decisions'
        ? (recursiveEvaluation?.hitOutcomes ?? thresholdHitOutcomes)
        : thresholdHitOutcomes
      const hitReturnPerUnit = mode === 'recursive-decisions'
        ? (recursiveEvaluation?.hitReturnPerUnit ?? thresholdHitReturnPerUnit)
        : thresholdHitReturnPerUnit
      const optimalAction: 'Stand' | 'Hit' = mode === 'recursive-decisions'
        ? (recursiveEvaluation?.action ?? (hitReturnPerUnit > standReturnPerUnit ? 'Hit' : 'Stand'))
        : (hitReturnPerUnit > standReturnPerUnit ? 'Hit' : 'Stand')

      const thresholdAction = determineThresholdAction(state.score, standThreshold ?? 17)
      const conflictsWithThreshold = mode === 'stand-threshold'
        ? optimalAction !== thresholdAction
        : false

      return {
        id: `${state.handType}-${state.score}`,
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
  }, [dealerScores, mode, recursiveDecisionModel, standThreshold])

  return (
    <main className="combination-page">
      <header className="combination-header">
        <p className="eyebrow">Blackjack Analyzer</p>
        <h1>Optimal Actions</h1>
        <p className="intro">
          {mode === 'stand-threshold'
            ? 'For each player score, compare expected outcomes for standing now versus hitting and then following the threshold policy. Hard and soft scores are shown separately.'
            : 'For each player score, compare expected outcomes for standing now versus hitting and then following recursive ROI-maximizing decisions.'}
        </p>
      </header>
      <section className="summary" aria-live="polite">
        <p>Dealer policy: stands on 17</p>
        <p>
          {mode === 'stand-threshold'
            ? `Player policy: stand at ${standThreshold ?? 17}+`
            : 'Player policy: recursive ROI maximization'}
        </p>
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
                    {group.conflictsWithThreshold && <span className="conflict-warning" aria-label="Conflicts with threshold">!</span>}
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
