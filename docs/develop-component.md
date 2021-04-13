# Develop a component

Developing a new component should come from a user need identified by at least one team while developing an application.
Make sure you test new components with users and you mark them as experimental (add `(experimental)` after the component name in the documentation file) until you collect enough feedback to be confident it could be used across applications.

## Read first

A component must:

* [meet the component principles](/docs/component_principles.md)
* [follow component conventions](/docs/component_conventions.md)

## Testing

If you create a component in the application, you can run accessibility tests against it.

The gem [includes integration tests](lib/govuk_publishing_components/minitest/component_guide_test.rb) to check that your component guide and examples are error free and that they meet basic accessibility needs.

Automated accessibility tests use [aXe](https://github.com/dequelabs/axe-core). Using our `AccessibilityTest` wrapper the gem runs the aXe suite against each example and throws JavaScript errors for any violations. These JavaScript errors can be used to fail a build in CI.

You can set this up by adding the following integration test.

```ruby
# test/integration/component_guide_test.rb
require 'govuk_publishing_components/minitest/component_guide_test'

class ComponentGuideTest < ActionDispatch::IntegrationTest
  include GovukPublishingComponents::Minitest::ComponentGuideTest
end
```

(There's no RSpec variant for this yet, PRs welcome)

### Exclude accessibility rules

Sometimes you will have a component that will throw an error due to it being in isolation, for example radio buttons not being in a fieldset.

For this case you can add `accessibility_excluded_rules` to your components' documentation yml file with the rules you want to exclude. These rules can be found in brackets in the error messages displayed.

For an example of this check [test/.../docs/test-component-with-duplicate-ids.yml](spec/dummy/app/views/components/docs/test-component-with-duplicate-ids.yml)


## Visual regression testing

Visual regression tests are run on each pull request using a third-party tool called [Percy](https://percy.io). This isn't a mandatory check, so any changes that are highlighted by Percy won't prevent a pull request from being merged in.

The screenshots are public, so they can be checked without logging in. A BrowserStack account is needed to approve or reject any changes.

The component guide also includes a visual diff tool that should make it easier to spot when you are introducing visual regressions in your components.

It can be run on a locally running version of the component guide, to compare it to the heroku master deploy. For example: [government-frontend.dev.gov.uk/component-guide](http://government-frontend.dev.gov.uk/component-guide) will be compared to [government-frontend.herokuapp.com/component-guide](https://government-frontend.herokuapp.com/component-guide).

The tool can be run via the console using the following command:
```js
  window.GOVUK.VisualDiffTool()
```
