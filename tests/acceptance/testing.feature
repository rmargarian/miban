Feature: Main list

  Testing manage main list

  Background: I am logged into the site
    Given I am logged into the site

  @TICKET-123
  Scenario: Look at the title
    Given I go to page "/admin"
    When I make screenshot "test"
    Then I wait for visible "PFA login" in "div"
