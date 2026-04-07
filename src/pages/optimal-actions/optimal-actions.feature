Feature: Optimal actions logic
  Optimal actions should correctly compare stand vs hit outcomes across different player scores and thresholds.

  Background:
    Given optimal-actions standard dealer probabilities from threshold 17

  Scenario: Score 4 hard with threshold 16 - compare stand vs hit
    When I compute optimal-actions outcomes for score 4 hand type "Hard" with threshold 16
    Then the optimal-actions stand return per unit should be less than the hit return per unit
    And the optimal-actions action with highest return should be "Hit"
    And the optimal-actions hit win probability should be greater than 0
    And the optimal-actions hit lose probability should be less than 1

  Scenario: Score 4 hard with threshold 17 - compare stand vs hit
    When I compute optimal-actions outcomes for score 4 hand type "Hard" with threshold 17
    Then the optimal-actions stand return per unit should be less than the hit return per unit
    And the optimal-actions action with highest return should be "Hit"
    And the optimal-actions hit win probability should be greater than 0

  Scenario: Score 20 hard with threshold 16 - compare stand vs hit
    When I compute optimal-actions outcomes for score 20 hand type "Hard" with threshold 16
    Then the optimal-actions stand return per unit should be greater than the hit return per unit
    And the optimal-actions action with highest return should be "Stand"
    And the optimal-actions stand win probability should be approximately 0.7

  Scenario: Score 20 hard with threshold 17 - compare stand vs hit
    When I compute optimal-actions outcomes for score 20 hand type "Hard" with threshold 17
    Then the optimal-actions stand return per unit should be greater than the hit return per unit
    And the optimal-actions action with highest return should be "Stand"
    And the optimal-actions threshold action for score 20 and threshold 17 should be "Stand"
