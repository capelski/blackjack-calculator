import type {
  CombinationItem,
  TreeDecisionPolicy,
} from './combinationsTreeLogic'
import {
  PAGE_SIZE,
  createPolicyTreeNavigator,
} from './combinationsTreeLogic'

export function collectFinalCombinationsWithPolicy(policy: TreeDecisionPolicy): CombinationItem[] {
  const treeNavigator = createPolicyTreeNavigator(policy, [])
  const total = treeNavigator.getTotalCombinations(true)
  const pages = Math.ceil(total / PAGE_SIZE)
  const items: CombinationItem[] = []

  for (let page = 0; page < pages; page += 1) {
    items.push(...treeNavigator.getPage(page, PAGE_SIZE, true))
  }

  return items
}
