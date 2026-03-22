import { Navigate, Route, Routes } from 'react-router-dom'
import CombinationsTreePage from './pages/CombinationsTreePage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/combinations-tree" replace />} />
      <Route path="/combinations-tree" element={<CombinationsTreePage />} />
      <Route path="*" element={<Navigate to="/combinations-tree" replace />} />
    </Routes>
  )
}

export default App
