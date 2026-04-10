import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import CombinationsTreePage from './pages/combinations-tree/CombinationsTreePage'
import FinalScoresPage from './pages/final-scores/FinalScoresPage'
import ExpectedResultsPage from './pages/expected-results/ExpectedResultsPage'
import OptimalActionsPage from './pages/optimal-actions/OptimalActionsPage'
import StandThresholdPage from './pages/stand-threshold/StandThresholdPage'
import RecursiveDecisionsPage from './pages/recursive-decisions/RecursiveDecisionsPage'
import RecursiveCombinationsTreePage from './pages/recursive-decisions/RecursiveCombinationsTreePage'
import RecursiveFinalScoresPage from './pages/recursive-decisions/RecursiveFinalScoresPage'
import RecursiveExpectedResultsPage from './pages/recursive-decisions/RecursiveExpectedResultsPage'
import RecursiveOptimalActionsPage from './pages/recursive-decisions/RecursiveOptimalActionsPage'

function App() {
  return (
    <div className="app-shell">
      <nav className="app-nav" aria-label="Main navigation">
        <NavLink
          to="/stand-threshold"
          className={({ isActive }) => (isActive ? 'app-link active' : 'app-link')}
        >
          Stand threshold
        </NavLink>
        <NavLink
          to="/recursive-decisions"
          className={({ isActive }) => (isActive ? 'app-link active' : 'app-link')}
        >
          Recursive decisions
        </NavLink>
      </nav>

      <Routes>
        <Route path="/" element={<Navigate to="/stand-threshold" replace />} />
        <Route path="/stand-threshold" element={<StandThresholdPage />}>
          <Route index element={<Navigate to="combinations-tree" replace />} />
          <Route path="combinations-tree" element={<CombinationsTreePage />} />
          <Route path="final-scores" element={<FinalScoresPage />} />
          <Route path="expected-results" element={<ExpectedResultsPage />} />
          <Route path="optimal-actions" element={<OptimalActionsPage />} />
        </Route>
        <Route path="/recursive-decisions" element={<RecursiveDecisionsPage />}>
          <Route index element={<Navigate to="combinations-tree" replace />} />
          <Route path="combinations-tree" element={<RecursiveCombinationsTreePage />} />
          <Route path="final-scores" element={<RecursiveFinalScoresPage />} />
          <Route path="expected-results" element={<RecursiveExpectedResultsPage />} />
          <Route path="optimal-actions" element={<RecursiveOptimalActionsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/stand-threshold" replace />} />
      </Routes>
    </div>
  )
}

export default App
