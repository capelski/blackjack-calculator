Feature: Combinations tree logic
  The combinations tree should expose deterministic navigation and filtering rules.

  Scenario: Parse sequence query into normalized card labels
    When I parse the sequence query "a, t  9"
    Then the parsed tokens should be "A,10,9"

  Scenario: Format probability above and below 0.01%
    When I format the probability value 0.5
    Then the formatted probability should be "50.0000%"
    When I format the probability value 0.0000002
    Then the formatted probability should be "2.00e-5%"

  Scenario: Count combinations without sequence filtering
    Given a tree navigator with threshold 4 and sequence ""
    When I ask for the total combinations with final hands only
    Then the total combinations should be 100
    When I ask for the total combinations including non-final hands
    Then the total combinations should be 111

  Scenario: Count combinations with sequence filtering
    Given a tree navigator with threshold 4 and sequence "A 10"
    When I ask for the total combinations with final hands only
    Then the total combinations should be 1

  Scenario: Return deterministic first page entries
    Given a tree navigator with threshold 4 and sequence ""
    When I request page 0 with page size 3 for final hands only
    Then the page should contain 3 combinations
    And the first combination should have score "12 (soft 2)" cards "A, A" and action "Stand"
    And the first combination probability should be approximately 0.0059171597633
    And the third combination should have cards "A, 3"
