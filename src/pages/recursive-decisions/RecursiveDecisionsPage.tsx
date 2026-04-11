import { Outlet } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { DecisionPolicyContext } from '../common/decisionPolicyContext'
import DecisionRootPageLayout from '../common/components/DecisionRootPageLayout'
import {
  createDealerScoresForStandardRules,
  createRecursiveDecisionModel,
} from './recursiveDecisionsLogic'
import './RecursiveDecisionsPage.css'

function RecursiveDecisionsPage() {
  const [doublingEnabled, setDoublingEnabled] = useState(false)
  const dealerScores = useMemo(() => createDealerScoresForStandardRules(), [])
  const recursiveDecisionModel = useMemo(
    () => createRecursiveDecisionModel(dealerScores, doublingEnabled),
    [dealerScores, doublingEnabled],
  )
  const decisionPolicy = useMemo(
    () => recursiveDecisionModel.createTreePolicy(),
    [recursiveDecisionModel],
  )

  return (
    <DecisionRootPageLayout
      pageClassName="recursive-decisions-page"
      navClassName="recursive-decisions-subnav"
      tabClassName="recursive-decisions-tab"
      contentClassName="recursive-decisions-content"
      navLabel="Recursive decision pages"
      title="Recursive Decisions"
      intro="The player decides recursively: at each hand state, choose stand or hit based on whichever action has the highest expected return per unit. Browse the same four analysis sections driven by that policy."
      controls={(
        <section className="controls recursive-decisions-controls" aria-label="Recursive decisions controls">
          <label className="recursive-decisions-checkbox-label">
            <input
              type="checkbox"
              checked={doublingEnabled}
              onChange={(e) => setDoublingEnabled(e.target.checked)}
            />
            Doubling
          </label>
        </section>
      )}
    >
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
    </DecisionRootPageLayout>
  )
}

export default RecursiveDecisionsPage
