Feature: Recursive decisions logic
  Recursive decisions should choose the action with the highest player ROI for each score state.

  Background:
    Given recursive-decisions standard dealer probabilities from threshold 17

  Scenario: Hard 20 favors standing
    When I evaluate recursive-decisions for score 20 hand type "Hard"
    Then the recursive-decisions action with highest return should be "Stand"
    And the recursive-decisions stand return per unit should be greater than the hit return per unit
    And the recursive-decisions stand win probability should be approximately 0.6996796343095288
    And the recursive-decisions stand draw probability should be approximately 0.1802524239096695
    And the recursive-decisions stand lose probability should be approximately 0.12006794178079241
    And the recursive-decisions stand return per unit should be approximately 1.5796116925287365
    And the recursive-decisions hit win probability should be approximately 0.0676870814014768
    And the recursive-decisions hit draw probability should be approximately 0.005594666436483349
    And the recursive-decisions hit lose probability should be approximately 0.9267182521620392
    And the recursive-decisions hit return per unit should be approximately 0.14096882923943768

  Scenario: Hard 4 favors hitting
    When I evaluate recursive-decisions for score 4 hand type "Hard"
    Then the recursive-decisions action with highest return should be "Hit"
    And the recursive-decisions hit return per unit should be greater than the stand return per unit
    And the recursive-decisions stand win probability should be approximately 0.2815928473666393
    And the recursive-decisions stand draw probability should be approximately 0
    And the recursive-decisions stand lose probability should be approximately 0.7184071526333515
    And the recursive-decisions stand return per unit should be approximately 0.5631856947332878
    And the recursive-decisions hit win probability should be approximately 0.3510675137934267
    And the recursive-decisions hit draw probability should be approximately 0.06899285175429551
    And the recursive-decisions hit lose probability should be approximately 0.5799396344522713
    And the recursive-decisions hit return per unit should be approximately 0.7711278793411557

  Scenario: Player ROI formula for stand and hit actions
    When I evaluate recursive-decisions for score 12 hand type "Hard"
    Then the recursive-decisions stand ROI should match win-loss formula
    And the recursive-decisions hit ROI should match win-loss formula

  Scenario: Best return per unit matches selected action ROI
    When I evaluate recursive-decisions for score 16 hand type "Hard"
    Then the recursive-decisions best return per unit should equal the selected action return
