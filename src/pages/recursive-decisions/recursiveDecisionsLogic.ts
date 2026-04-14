import type {
  CombinationItem,
  TreeDecisionPolicy,
} from '../common/combinationsTreeLogic.ts'
import {
  PAGE_SIZE,
  createPolicyTreeNavigator,
} from '../common/combinationsTreeLogic.ts'
import type {
  OutcomeTotals,
  ScoreState,
} from '../optimal-actions/optimalActionsLogic.ts'
import {
  DRAW_OPTIONS,
  collectFinalCombinations,
  computeHitTransition,
  computeStandOutcomes,
  groupScores,
} from '../optimal-actions/optimalActionsLogic.ts'

export type RecursiveEvaluation = {
  standOutcomes: OutcomeTotals
  standReturnPerUnit: number
  hitOutcomes: OutcomeTotals
  hitReturnPerUnit: number
  doubleOutcomes: OutcomeTotals
  doubleReturnPerUnit: number
  bestOutcomes: OutcomeTotals
  bestReturnPerUnit: number
  action: 'Stand' | 'Hit' | 'Double'
}

export type RecursiveDecisionModel = {
  evaluateState: (state: ScoreState) => RecursiveEvaluation
  selectAction: (score: number, isSoft: boolean) => 'Stand' | 'Hit' | 'Double'
  createTreePolicy: () => TreeDecisionPolicy
}

function stateKey(state: ScoreState): string {
  return `${state.score}:${state.isSoft ? 'soft' : 'hard'}`
}

function toState(score: number, isSoft: boolean): ScoreState {
  return {
    score,
    handType: isSoft ? 'Soft' : 'Hard',
    isSoft,
  }
}

function outcomesForBust(): OutcomeTotals {
  return {
    win: 0,
    draw: 0,
    lose: 1,
  }
}

function cloneOutcomes(outcomes: OutcomeTotals): OutcomeTotals {
  return {
    win: outcomes.win,
    draw: outcomes.draw,
    lose: outcomes.lose,
  }
}

export function createDealerScoresForStandardRules(): Map<string, number> {
  return groupScores(collectFinalCombinations(17))
}

export function createRecursiveDecisionModel(dealerScores: Map<string, number>, doublingEnabled = false): RecursiveDecisionModel {
  const cache = new Map<string, RecursiveEvaluation>()

  const evaluateState = (state: ScoreState): RecursiveEvaluation => {
    const key = stateKey(state)
    const cached = cache.get(key)

    if (cached) {
      return cached
    }

    const standOutcomes = computeStandOutcomes(`${state.score}`, dealerScores)
    const standReturnPerUnit = 1 + standOutcomes.win - standOutcomes.lose

    const hitOutcomes: OutcomeTotals = {
      win: 0,
      draw: 0,
      lose: 0,
    }
    let hitReturnPerUnit = 0

    for (const draw of DRAW_OPTIONS) {
      const transition = computeHitTransition(state, draw.cardValue)

      if (transition.bust) {
        const bustOutcomes = outcomesForBust()
        hitOutcomes.win += bustOutcomes.win * draw.probability
        hitOutcomes.draw += bustOutcomes.draw * draw.probability
        hitOutcomes.lose += bustOutcomes.lose * draw.probability
        continue
      }

      const nextEvaluation = evaluateState(toState(transition.total, transition.isSoft))
      hitOutcomes.win += nextEvaluation.bestOutcomes.win * draw.probability
      hitOutcomes.draw += nextEvaluation.bestOutcomes.draw * draw.probability
      hitOutcomes.lose += nextEvaluation.bestOutcomes.lose * draw.probability
      hitReturnPerUnit += nextEvaluation.bestReturnPerUnit * draw.probability
    }

    const hitVsStandAction: 'Stand' | 'Hit' = hitReturnPerUnit > standReturnPerUnit ? 'Hit' : 'Stand'
    const bestReturnPerUnit = hitVsStandAction === 'Hit' ? hitReturnPerUnit : standReturnPerUnit
    const bestOutcomes = hitVsStandAction === 'Hit' ? cloneOutcomes(hitOutcomes) : cloneOutcomes(standOutcomes)

    const doubleOutcomes: OutcomeTotals = { win: 0, draw: 0, lose: 0 }
    let doubleReturnPerUnit = 0

    if (doublingEnabled) {
      for (const draw of DRAW_OPTIONS) {
        const transition = computeHitTransition(state, draw.cardValue)

        if (transition.bust) {
          doubleOutcomes.lose += draw.probability
          continue
        }

        const nextStandOutcomes = computeStandOutcomes(`${transition.total}`, dealerScores)
        doubleOutcomes.win += draw.probability * nextStandOutcomes.win
        doubleOutcomes.draw += draw.probability * nextStandOutcomes.draw
        doubleOutcomes.lose += draw.probability * nextStandOutcomes.lose
      }

      doubleReturnPerUnit = 1 + 2 * (doubleOutcomes.win - doubleOutcomes.lose)
    }

    const action: 'Stand' | 'Hit' | 'Double' =
      doublingEnabled && doubleReturnPerUnit > bestReturnPerUnit ? 'Double' : hitVsStandAction

    const evaluation: RecursiveEvaluation = {
      standOutcomes,
      standReturnPerUnit,
      hitOutcomes,
      hitReturnPerUnit,
      doubleOutcomes,
      doubleReturnPerUnit,
      bestOutcomes,
      bestReturnPerUnit,
      action,
    }

    cache.set(key, evaluation)
    return evaluation
  }

  return {
    evaluateState,
    selectAction: (score: number, isSoft: boolean) =>
      evaluateState(toState(score, isSoft)).action,
    createTreePolicy: () => ({ score, cardCount, isSoft, hasBlackjack }) => {
      if (hasBlackjack || score > 21) {
        return 'Stand'
      }

      if (cardCount < 2) {
        return 'Hit'
      }

      return evaluateState(toState(score, isSoft)).action
    },
  }
}

export function collectRecursiveFinalCombinations(policy: TreeDecisionPolicy): CombinationItem[] {
  const treeNavigator = createPolicyTreeNavigator(policy, [])
  const total = treeNavigator.getTotalCombinations(true)
  const pages = Math.ceil(total / PAGE_SIZE)
  const items: CombinationItem[] = []

  for (let page = 0; page < pages; page += 1) {
    items.push(...treeNavigator.getPage(page, PAGE_SIZE, true))
  }

  return items
}
