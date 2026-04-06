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

  Scenario: Aggregate win, draw, lose and blackjack-win probabilities
    Given player expected-result probabilities "Blackjack=0.2,20=0.3,22+=0.5"
    And dealer expected-result probabilities "Blackjack=0.1,19=0.4,22+=0.5"
    When I aggregate expected-result outcomes
    Then expected-result wins should be approximately 0.45
    And expected-result blackjack wins should be approximately 0.18
    And expected-result draws should be approximately 0.02
    And expected-result losses should be approximately 0.53
    And expected-result outcome probabilities should sum to approximately 1

  Scenario: Compute player ROI from aggregated outcomes
    Given expected-result totals with wins 0.45 blackjack wins 0.18 draws 0.02 and losses 0.53
    When I compute expected-result player ROI
    Then regular win probability should be approximately 0.27
    And net ROI should be approximately 0.01
    And return per unit invested should be approximately 1.01