import type { CombinationItem } from '../combinationsTreeLogic'
import { formatProbability } from '../combinationsTreeLogic'

type HandOutcomesTableProps = {
  combinations: CombinationItem[]
  keyPrefix: string
  mode?: 'full' | 'cards-probability'
}

function HandOutcomesTable({
  combinations,
  keyPrefix,
  mode = 'full',
}: HandOutcomesTableProps) {
  const isCompactMode = mode === 'cards-probability'

  return (
    <section
      className={`combination-table ${isCompactMode ? 'compact-columns' : ''}`.trim()}
      aria-label="Blackjack hand combinations"
    >
      <div className="combination-table-header" role="row">
        {!isCompactMode && <span role="columnheader">Hand score</span>}
        <span role="columnheader">Cards</span>
        <span role="columnheader">Probability</span>
        {!isCompactMode && <span role="columnheader">Action</span>}
      </div>

      <ul className="combination-list">
        {combinations.map((combination, index) => (
          <li key={`${keyPrefix}-${index}`} className="combination-row" role="row">
            {!isCompactMode && (
              <span className="cell score" data-label="Hand score" role="cell">
                {combination.score}
              </span>
            )}
            <span className="cell cards" data-label="Cards" role="cell">
              {combination.cards}
            </span>
            <span className="cell probability" data-label="Probability" role="cell">
              {formatProbability(combination.probability)}
            </span>
            {!isCompactMode && (
              <span
                className={`cell action ${combination.action.toLowerCase()}`}
                data-label="Action"
                role="cell"
              >
                {combination.action}
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

export default HandOutcomesTable
