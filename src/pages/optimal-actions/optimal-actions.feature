Feature: Optimal actions logic
  Optimal actions helper functions should produce deterministic transitions and outcomes.

  Scenario: Group score labels from combination results
    Given optimal-actions combinations "19 (soft 9)=0.25,19=0.5,22+=0.25"
    When I group optimal-actions scores
    Then grouped score "19" should have probability approximately 0.75
    And grouped score "22+" should have probability approximately 0.25

  Scenario: Compute hit transition with soft ace adjustment
    When I compute optimal-actions hit transition for score 12 hand type "Soft" with card value 10
    Then the optimal-actions transition total should be 12
    And the optimal-actions transition should be soft false and bust false

  Scenario: Determine action from stand threshold
    When I determine optimal-actions threshold action for score 16 and threshold 17
    Then the optimal-actions threshold action should be "Hit"
    When I determine optimal-actions threshold action for score 17 and threshold 17
    Then the optimal-actions threshold action should be "Stand"

  Scenario: Compute hit outcomes for a high hard score
    Given optimal-actions dealer probabilities "22+=1"
    When I compute optimal-actions hit outcomes for score 20 hand type "Hard" with threshold 21
    Then optimal-actions win probability should be approximately 0.07692307692307693
    And optimal-actions draw probability should be approximately 0
    And optimal-actions lose probability should be approximately 0.9230769230769231

  Scenario: List score states in deterministic order
    When I list optimal-actions score states
    Then optimal-actions score state count should be 28
    And the first optimal-actions state should be score 4 hand type "Hard"
    And the last optimal-actions state should be score 21 hand type "Soft"
