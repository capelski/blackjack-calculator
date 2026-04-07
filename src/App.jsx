import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import CombinationsTreePage from './pages/combinations-tree/CombinationsTreePage'
import FinalScoresPage from './pages/final-scores/FinalScoresPage'
import ExpectedResultsPage from './pages/expected-results/ExpectedResultsPage'
import OptimalActionsPage from './pages/optimal-actions/OptimalActionsPage'

function App() {
  return (
    <div className="app-shell">
      <nav className="app-nav" aria-label="Main navigation">
        <NavLink
          to="/combinations-tree"
          className={({ isActive }) => (isActive ? 'app-link active' : 'app-link')}
        >
          Combinations tree
        </NavLink>
        <NavLink
          to="/final-scores"
          className={({ isActive }) => (isActive ? 'app-link active' : 'app-link')}
        >
          Final scores
        </NavLink>
        <NavLink
          to="/expected-results"
          className={({ isActive }) => (isActive ? 'app-link active' : 'app-link')}
        >
          Expected results
        </NavLink>
        <NavLink
          to="/optimal-actions"
          className={({ isActive }) => (isActive ? 'app-link active' : 'app-link')}
        >
          Optimal actions
        </NavLink>
      </nav>

      <Routes>
        <Route path="/" element={<Navigate to="/combinations-tree" replace />} />
        <Route path="/combinations-tree" element={<CombinationsTreePage />} />
        <Route path="/final-scores" element={<FinalScoresPage />} />
        <Route path="/expected-results" element={<ExpectedResultsPage />} />
        <Route path="/optimal-actions" element={<OptimalActionsPage />} />
        <Route path="*" element={<Navigate to="/combinations-tree" replace />} />
      </Routes>
    </div>
  )
}

export default App
