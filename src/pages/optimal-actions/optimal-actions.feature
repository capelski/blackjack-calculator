Feature: Optimal actions logic
  Optimal actions should correctly compare stand vs hit outcomes across different player scores and thresholds.

  Background:
    Given optimal-actions standard dealer probabilities from threshold 17

  Scenario: Score 4 hard with threshold 16 - compare stand vs hit
    When I compute optimal-actions outcomes for score 4 hand type "Hard" with threshold 16
    Then the optimal-actions stand return per unit should be approximately 0.5632
    And the optimal-actions hit return per unit should be approximately 0.7658

  Scenario: Score 4 hard with threshold 17 - compare stand vs hit
    When I compute optimal-actions outcomes for score 4 hand type "Hard" with threshold 17
    Then the optimal-actions stand return per unit should be approximately 0.5632
    And the optimal-actions hit return per unit should be approximately 0.7570

  Scenario: Score 20 hard with threshold 16 - compare stand vs hit
    When I compute optimal-actions outcomes for score 20 hand type "Hard" with threshold 16
    Then the optimal-actions stand return per unit should be approximately 1.5796
    And the optimal-actions hit return per unit should be approximately 0.1410

  Scenario: Score 20 hard with threshold 17 - compare stand vs hit
    When I compute optimal-actions outcomes for score 20 hand type "Hard" with threshold 17
    Then the optimal-actions stand return per unit should be approximately 1.5796
    And the optimal-actions hit return per unit should be approximately 0.1410
