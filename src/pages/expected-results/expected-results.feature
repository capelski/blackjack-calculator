Feature: Expected results logic
  Expected results should classify outcomes and compute ROI with blackjack payout rules.

  Scenario Outline: Classify a player/dealer score matchup
    When I classify expected-result outcome for player score <playerScore> and dealer score <dealerScore>
    Then the expected-result outcome should be <outcome>

    Examples:
      | playerScore  | dealerScore | outcome |
      | "Blackjack" | "Blackjack" | "draw" |
      | "Blackjack" | "20"        | "win"  |
      | "20"        | "Blackjack" | "lose" |
      | "22+"       | "18"        | "lose" |
      | "18"        | "22+"       | "win"  |
      | "19"        | "19"        | "draw" |

  Scenario: Aggregate win, draw and lose probabilities
    Given player expected-result probabilities "17=0.14512590450523469,18=0.13949692685146797,19=0.13346395558618698,20=0.18025242390966950,21=0.072730663674283533,22+=0.28159284736663931,Blackjack=0.047337278106508882"
    And dealer expected-result probabilities "17=0.14512590450523469,18=0.13949692685146797,19=0.13346395558618698,20=0.18025242390966950,21=0.072730663674283533,22+=0.28159284736663931,Blackjack=0.047337278106508882"
    When I aggregate expected-result outcomes
    Then expected-result wins should be approximately 0.41117520822470316
    And expected-result draws should be approximately 0.09835505186252388
    And expected-result losses should be approximately 0.49046973991275467
    And expected-result outcome probabilities should sum to approximately 1

  Scenario: Aggregate ROI from score matchups
    Given player expected-result probabilities "17=0.14512590450523469,18=0.13949692685146797,19=0.13346395558618698,20=0.18025242390966950,21=0.072730663674283533,22+=0.28159284736663931,Blackjack=0.047337278106508882"
    And dealer expected-result probabilities "17=0.14512590450523469,18=0.13949692685146797,19=0.13346395558618698,20=0.18025242390966950,21=0.072730663674283533,22+=0.28159284736663931,Blackjack=0.047337278106508882"
    When I aggregate expected-result outcomes
    Then expected-result ROI should be approximately -0.05674630158406374
    And expected-result return per unit invested should be approximately 0.9432536984159363

  Scenario: Aggregate ROI with doubling-enabled player probabilities
    Given player expected-result probabilities with bet sizes "20@1=0.5,20@2=0.5"
    And dealer expected-result probabilities "17=1"
    When I aggregate expected-result outcomes
    Then expected-result wins should be approximately 1
    And expected-result draws should be approximately 0
    And expected-result losses should be approximately 0
    And expected-result ROI should be approximately 1.5
    And expected-result return per unit invested should be approximately 2.5