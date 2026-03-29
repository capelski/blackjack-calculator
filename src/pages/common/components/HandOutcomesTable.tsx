import type { CombinationItem } from '../../combinations-tree/combinationsTreeLogic'
import { formatProbability } from '../../combinations-tree/combinationsTreeLogic'

type HandOutcomesTableProps = {
  combinations: CombinationItem[]
  keyPrefix: string
}

function HandOutcomesTable({ combinations, keyPrefix }: HandOutcomesTableProps) {
  return (
    <section className="combination-table" aria-label="Blackjack hand combinations">
      <div className="combination-table-header" role="row">
        <span role="columnheader">Hand score</span>
        <span role="columnheader">Cards</span>
        <span role="columnheader">Probability</span>
        <span role="columnheader">Action</span>
      </div>

      <ul className="combination-list">
        {combinations.map((combination, index) => (
          <li key={`${keyPrefix}-${index}`} className="combination-row" role="row">
            <span className="cell score" data-label="Hand score" role="cell">
              {combination.score}
            </span>
            <span className="cell cards" data-label="Cards" role="cell">
              {combination.cards}
            </span>
            <span className="cell probability" data-label="Probability" role="cell">
              {formatProbability(combination.probability)}
            </span>
            <span className={`cell action ${combination.action.toLowerCase()}`} data-label="Action" role="cell">
              {combination.action}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default HandOutcomesTable
