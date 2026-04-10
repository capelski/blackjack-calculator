import { Outlet } from 'react-router-dom'
import { useMemo, useState } from 'react'
import StandThresholdSlider from '../common/components/StandThresholdSlider'
import { DecisionPolicyContext } from '../common/decisionPolicyContext'
import DecisionRootPageLayout from '../common/components/DecisionRootPageLayout'
import './StandThresholdPage.css'

function StandThresholdPage() {
  const [standThreshold, setStandThreshold] = useState<number>(17)
  const decisionPolicy = useMemo(
    () => ({ score, cardCount }: { score: number; cardCount: number }) =>
      (cardCount >= 2 && score >= standThreshold ? 'Stand' : 'Hit'),
    [standThreshold],
  )

  return (
    <DecisionRootPageLayout
      pageClassName="stand-threshold-page"
      navClassName="stand-threshold-subnav"
      tabClassName="stand-threshold-tab"
      contentClassName="stand-threshold-content"
      navLabel="Stand threshold pages"
      title="Stand Threshold"
      intro="Set the stand threshold once and review how it affects each analysis view. Switch between nested pages to inspect combinations, final scores, expected results, and optimal actions with the same threshold."
      controls={(
        <section className="controls" aria-label="Stand threshold controls">
          <StandThresholdSlider
            value={standThreshold}
            inputId="stand-threshold-shared-slider"
            onChange={setStandThreshold}
          />
        </section>
      )}
    >
        <DecisionPolicyContext.Provider
          value={{
            mode: 'stand-threshold',
            decisionPolicy,
            standThreshold,
            recursiveDecisionModel: null,
          }}
        >
          <Outlet />
        </DecisionPolicyContext.Provider>
    </DecisionRootPageLayout>
  )
}

export default StandThresholdPage
