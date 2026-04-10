Feature: Recursive decisions logic
  Recursive decisions should choose the action with the highest player ROI for each score state.

  Background:
    Given recursive-decisions standard dealer probabilities from threshold 17

  Scenario: Hard 20 favors standing
    When I evaluate recursive-decisions for score 20 hand type "Hard"
    Then the recursive-decisions action with highest return should be "Stand"
    And the recursive-decisions stand return per unit should be greater than the hit return per unit

  Scenario: Hard 4 favors hitting
    When I evaluate recursive-decisions for score 4 hand type "Hard"
    Then the recursive-decisions action with highest return should be "Hit"
    And the recursive-decisions hit return per unit should be greater than the stand return per unit

  Scenario: Player ROI formula for stand and hit actions
    When I evaluate recursive-decisions for score 12 hand type "Hard"
    Then the recursive-decisions stand ROI should match win-loss formula
    And the recursive-decisions hit ROI should match win-loss formula

  Scenario: Best return per unit matches selected action ROI
    When I evaluate recursive-decisions for score 16 hand type "Hard"
    Then the recursive-decisions best return per unit should equal the selected action return
