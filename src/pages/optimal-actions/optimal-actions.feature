Feature: Optimal actions logic
  Optimal actions should correctly compare stand vs hit outcomes across different player scores and thresholds.

  Background:
    Given optimal-actions standard dealer probabilities from threshold 17

  Scenario: Score 4 hard with threshold 16 - compare stand vs hit
    When I compute optimal-actions outcomes for score 4 hand type "Hard" with threshold 16
    Then the optimal-actions stand return per unit should be approximately 0.5632
    And the optimal-actions hit return per unit should be approximately 0.7658
    And the optimal-actions action with highest return should be "Hit"

  Scenario: Score 4 hard with threshold 17 - compare stand vs hit
    When I compute optimal-actions outcomes for score 4 hand type "Hard" with threshold 17
    Then the optimal-actions stand return per unit should be approximately 0.5632
    And the optimal-actions hit return per unit should be approximately 0.7570
    And the optimal-actions action with highest return should be "Hit"

  Scenario: Score 20 hard with threshold 16 - compare stand vs hit
    When I compute optimal-actions outcomes for score 20 hand type "Hard" with threshold 16
    Then the optimal-actions stand return per unit should be approximately 1.5796
    And the optimal-actions hit return per unit should be approximately 0.1410
    And the optimal-actions action with highest return should be "Stand"

  Scenario: Score 20 hard with threshold 17 - compare stand vs hit
    When I compute optimal-actions outcomes for score 20 hand type "Hard" with threshold 17
    Then the optimal-actions stand return per unit should be approximately 1.5796
    And the optimal-actions hit return per unit should be approximately 0.1410
    And the optimal-actions action with highest return should be "Stand"

  Scenario: Score 11 hard with doubling mode enabled - compare stand vs hit vs double
    When I compute optimal-actions recursive outcomes for score 11 hand type "Hard" with doubling enabled
    Then the optimal-actions stand return per unit should be approximately 0.5632
    And the optimal-actions hit return per unit should be approximately 1.1440
    And the optimal-actions double return per unit should be approximately 1.2605
    And the optimal-actions double return per unit should be greater than the hit return per unit
    And the optimal-actions action with highest return should be "Double"

  Scenario: Score 20 hard with doubling mode enabled - stand remains optimal
    When I compute optimal-actions recursive outcomes for score 20 hand type "Hard" with doubling enabled
    Then the optimal-actions stand return per unit should be approximately 1.5796
    And the optimal-actions hit return per unit should be approximately 0.1410
    And the optimal-actions double return per unit should be approximately -0.7181
    And the optimal-actions action with highest return should be "Stand"
