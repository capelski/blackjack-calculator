import { useEffect } from 'react'
import type { CombinationItem } from '../../common/combinationsTreeLogic'
import HandOutcomesTable from '../../common/components/HandOutcomesTable'

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
          <HandOutcomesTable combinations={combinations} keyPrefix="final-score-modal" />
        </div>
      </section>
    </div>
  )
}

export default FinalScoreModal
