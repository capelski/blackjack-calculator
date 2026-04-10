import { NavLink, Outlet } from 'react-router-dom'
import { useMemo } from 'react'
import { DecisionPolicyContext } from '../common/decisionPolicyContext'
import {
  createDealerScoresForStandardRules,
  createRecursiveDecisionModel,
} from './recursiveDecisionsLogic'
import './RecursiveDecisionsPage.css'

function RecursiveDecisionsPage() {
  const dealerScores = useMemo(() => createDealerScoresForStandardRules(), [])
  const recursiveDecisionModel = useMemo(
    () => createRecursiveDecisionModel(dealerScores),
    [dealerScores],
  )
  const decisionPolicy = useMemo(
    () => recursiveDecisionModel.createTreePolicy(),
    [recursiveDecisionModel],
  )

  return (
    <div className="combination-page recursive-decisions-page">
      <header className="combination-header">
        <p className="eyebrow">Blackjack Analyzer</p>
        <h1>Recursive Decisions</h1>
        <p className="intro">
          The player decides recursively: at each hand state, choose stand or hit based on
          whichever action has the highest expected return per unit. Browse the same
          four analysis sections driven by that policy.
        </p>
      </header>

      <nav className="recursive-decisions-subnav" aria-label="Recursive decision pages">
        <NavLink
          to="combinations-tree"
          className={({ isActive }) => (isActive ? 'recursive-decisions-tab active' : 'recursive-decisions-tab')}
        >
          Combinations tree
        </NavLink>
        <NavLink
          to="final-scores"
          className={({ isActive }) => (isActive ? 'recursive-decisions-tab active' : 'recursive-decisions-tab')}
        >
          Final scores
        </NavLink>
        <NavLink
          to="expected-results"
          className={({ isActive }) => (isActive ? 'recursive-decisions-tab active' : 'recursive-decisions-tab')}
        >
          Expected results
        </NavLink>
        <NavLink
          to="optimal-actions"
          className={({ isActive }) => (isActive ? 'recursive-decisions-tab active' : 'recursive-decisions-tab')}
        >
          Optimal actions
        </NavLink>
      </nav>

      <section className="recursive-decisions-content">
        <DecisionPolicyContext.Provider
          value={{
            mode: 'recursive-decisions',
            decisionPolicy,
            standThreshold: null,
            recursiveDecisionModel,
          }}
        >
          <Outlet />
        </DecisionPolicyContext.Provider>
      </section>
    </div>
  )
}

export default RecursiveDecisionsPage
