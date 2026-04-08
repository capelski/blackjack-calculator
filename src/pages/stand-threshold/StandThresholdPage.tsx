import { NavLink, Outlet } from 'react-router-dom'
import { useState } from 'react'
import StandThresholdSlider from '../common/components/StandThresholdSlider'
import type { StandThresholdOutletContext } from './standThresholdContext'
import './StandThresholdPage.css'

function StandThresholdPage() {
  const [standThreshold, setStandThreshold] = useState<number>(17)

  return (
    <div className="combination-page stand-threshold-page">
      <header className="combination-header">
        <p className="eyebrow">Blackjack Analyzer</p>
        <h1>Stand Threshold</h1>
        <p className="intro">
          Set the stand threshold once and review how it affects each analysis view.
          Switch between nested pages to inspect combinations, final scores, expected
          results, and optimal actions with the same threshold.
        </p>
      </header>

      <section className="controls" aria-label="Stand threshold controls">
        <StandThresholdSlider
          value={standThreshold}
          inputId="stand-threshold-shared-slider"
          onChange={setStandThreshold}
        />
      </section>

      <nav className="stand-threshold-subnav" aria-label="Stand threshold pages">
        <NavLink
          to="combinations-tree"
          className={({ isActive }) => (isActive ? 'stand-threshold-tab active' : 'stand-threshold-tab')}
        >
          Combinations tree
        </NavLink>
        <NavLink
          to="final-scores"
          className={({ isActive }) => (isActive ? 'stand-threshold-tab active' : 'stand-threshold-tab')}
        >
          Final scores
        </NavLink>
        <NavLink
          to="expected-results"
          className={({ isActive }) => (isActive ? 'stand-threshold-tab active' : 'stand-threshold-tab')}
        >
          Expected results
        </NavLink>
        <NavLink
          to="optimal-actions"
          className={({ isActive }) => (isActive ? 'stand-threshold-tab active' : 'stand-threshold-tab')}
        >
          Optimal actions
        </NavLink>
      </nav>

      <section className="stand-threshold-content">
        <Outlet context={{ standThreshold } satisfies StandThresholdOutletContext} />
      </section>
    </div>
  )
}

export default StandThresholdPage
