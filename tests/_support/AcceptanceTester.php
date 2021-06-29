<?php


/**
 * Inherited Methods
 * @method void wantToTest($text)
 * @method void wantTo($text)
 * @method void execute($callable)
 * @method void expectTo($prediction)
 * @method void expect($prediction)
 * @method void amGoingTo($argumentation)
 * @method void am($role)
 * @method void lookForwardTo($achieveValue)
 * @method void comment($description)
 * @method void pause()
 *
 * @SuppressWarnings(PHPMD)
*/
class AcceptanceTester extends \Codeception\Actor
{
    use _generated\AcceptanceTesterActions;

    /**
     * @Given I am logged into the site
     */
    public function iAmLoggedIntoTheSite(): void
    {
        // TODO: Implement it if need
    }

    /**
     * @Given I go to page :url
     *
     * @param string $url
     */
    public function iGoToPageUrl(string $url): void
    {
        $this->amOnPage($url);
    }

    /**
     * @When I make screenshot :name
     *
     * @param string $name
     */
    public function iMakeScreenshot(string $name): void
    {
        $this->makeScreenshot($name);
    }

    /**
     * @When I wait for visible :text in :tag
     *
     * @param string $text
     * @param string $tag
     *
     * @throws Exception
     */
    public function iWaitForVisibleInSelector(string $text, string $tag): void
    {
        $element = '//'.$tag."[contains(text(),'$text')]";
        $this->waitForElementVisible($element, 15);
    }
}
