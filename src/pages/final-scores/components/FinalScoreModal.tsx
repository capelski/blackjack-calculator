import { useEffect } from 'react'
import type { CombinationItem } from '../../combinations-tree/combinationsTreeLogic'
import { formatProbability } from '../../combinations-tree/combinationsTreeLogic'

type FinalScoreModalProps = {
  isOpen: boolean
  title: string
  combinations: CombinationItem[]
  onClose: () => void
}

function FinalScoreModal({ isOpen, title, combinations, onClose }: FinalScoreModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <section
        className="modal-content"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="modal-header">
          <h2>{title}</h2>
          <button type="button" className="modal-close" onClick={onClose}>
            Close
          </button>
        </header>

        <p className="modal-summary">Combinations in this final score: {combinations.length.toLocaleString()}</p>

        <div className="modal-table">
          <div className="combination-table-header" role="row">
            <span role="columnheader">Hand score</span>
            <span role="columnheader">Cards</span>
            <span role="columnheader">Probability</span>
            <span role="columnheader">Action</span>
          </div>

          <ul className="combination-list">
            {combinations.map((combination, index) => (
              <li key={`${combination.cards}-${index}`} className="combination-row" role="row">
                <span className="cell score" data-label="Hand score" role="cell">
                  {combination.score}
                </span>
                <span className="cell cards" data-label="Cards" role="cell">
                  {combination.cards}
                </span>
                <span className="cell probability" data-label="Probability" role="cell">
                  {formatProbability(combination.probability)}
                </span>
                <span
                  className={`cell action ${combination.action.toLowerCase()}`}
                  data-label="Action"
                  role="cell"
                >
                  {combination.action}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}

export default FinalScoreModal
