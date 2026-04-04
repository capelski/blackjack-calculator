Feature: Final scores logic
  Final score helper functions should normalize and order score groups predictably.

  Scenario: Normalize score labels for grouping
    When I normalize final score label "Blackjack"
    Then the normalized final score label should be "Blackjack"
    When I normalize final score label "19 (soft 9)"
    Then the normalized final score label should be "19"
    When I normalize final score label "22+"
    Then the normalized final score label should be "22+"
    When I normalize final score label "25 (bust)"
    Then the normalized final score label should be "22+"

  Scenario: Sort final scores ascending with blackjack before bust
    Given final score groups with labels "18,Blackjack,20,21,22+,17"
    When I sort final score groups
    Then the sorted final score labels should be "17,18,20,21,Blackjack,22+"

  Scenario: Compare two final score groups
    When I compare final score groups "22+" and "20"
    Then the compare result should be greater than 0
    When I compare final score groups "Blackjack" and "20"
    Then the compare result should be greater than 0