import { useMemo } from 'react'
import { formatProbability } from '../common/combinationsTreeLogic'
import { listScoreStates, type OutcomeTotals } from '../optimal-actions/optimalActionsLogic'
import {
  createDealerScoresForStandardRules,
  createRecursiveDecisionModel,
} from './recursiveDecisionsLogic'

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
}

function formatReturnPerUnit(value: number): string {
  return `${value.toFixed(4)}x`
}

function RecursiveOptimalActionsPage() {
  const dealerScores = useMemo(() => createDealerScoresForStandardRules(), [])
  const decisionModel = useMemo(() => createRecursiveDecisionModel(dealerScores), [dealerScores])

  const scoreActionGroups = useMemo<ScoreActionGroup[]>(() => {
    const states = listScoreStates()

    return states.map((state) => {
      const evaluation = decisionModel.evaluateState(state)

      return {
        id: `${state.handType}-${state.score}`,
        scoreLabel: state.handType === 'Soft' ? `${state.score} (soft)` : `${state.score}`,
        rows: [
          {
            action: 'Stand',
            outcomes: evaluation.standOutcomes,
            returnPerUnit: evaluation.standReturnPerUnit,
          },
          {
            action: 'Hit',
            outcomes: evaluation.hitOutcomes,
            returnPerUnit: evaluation.hitReturnPerUnit,
          },
        ],
        optimalAction: evaluation.action,
      }
    })
  }, [decisionModel])

  return (
    <main className="combination-page">
      <header className="combination-header">
        <p className="eyebrow">Blackjack Analyzer</p>
        <h1>Optimal Actions</h1>
        <p className="intro">
          For each hard and soft player score, compare standing now versus following
          the recursive hit policy. The optimal action maximizes expected return per unit.
        </p>
      </header>
      <section className="summary" aria-live="polite">
        <p>Dealer policy: stands on 17</p>
        <p>Player policy: recursive ROI maximization</p>
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
                  <td rowSpan={2} className="optimal-action-cell">{group.optimalAction}</td>
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

export default RecursiveOptimalActionsPage
