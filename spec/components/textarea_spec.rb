require 'rails_helper'

describe "Textarea", type: :view do
  def component_name
    "textarea"
  end

  it "fails to render when no data is given" do
    assert_raises do
      render_component({})
    end
  end

  it "renders textarea with name and label text" do
    render_component(
      label: { text: "Can you provide more detail?" },
      name: "more-details",
    )

    assert_select ".govuk-textarea"
    assert_select ".govuk-textarea[name='more-details']"

    assert_select ".govuk-label", text: "Can you provide more detail?"
  end

  it "renders textarea with a custom number of rows" do
    render_component(
      name: "custom-rows",
      rows: 10,
    )

    assert_select ".govuk-textarea"
    assert_select ".govuk-textarea[rows='10']"
  end

  it "renders textarea with a data attributes" do
    render_component(
      data: { module: "contextual-guidance" },
      name: "with-data-attributes"
    )

    assert_select ".govuk-textarea[data-module='contextual-guidance']"
  end

  it "renders textarea with disabled spellcheck" do
    render_component(
      spellcheck: "false",
      name: "with-disabled-spellcheck"
    )

    assert_select ".govuk-textarea[spellcheck='false']"
  end

  it "sets the 'for' on the label to the textarea id" do
    render_component(
      label: { text: "Can you provide more detail?" },
      name: "more-detail-label"
    )

    textarea = css_select(".govuk-textarea")
    textarea_id = textarea.attr("id").text

    assert_select ".govuk-label[for='#{textarea_id}']"
  end

  it "sets the value when provided" do
    render_component(
      name: "more-detail-value",
      value: "More detail provided",
    )

    assert_select ".govuk-textarea", text: "More detail provided"
  end

  context "when a hint is provided" do
    before do
      render_component(
        name: "more-detail-hint",
        hint: "Don’t include personal or financial information, eg your National Insurance number or credit card details.",
      )
    end

    it "renders the hint" do
      assert_select ".govuk-hint", text: "Don’t include personal or financial information, eg your National Insurance number or credit card details."
    end

    it "has 'aria-describedby' the hint id" do
      hint_id = css_select(".govuk-hint").attr("id")

      assert_select ".govuk-textarea[aria-describedby='#{hint_id}']"
    end
  end

  context "when an error_message is provided" do
    before do
      render_component(
        name: "more-detail-hint-error-message",
        error_message: "Please enter more detail",
      )
    end

    it "renders the error message" do
      assert_select ".govuk-error-message", text: "Please enter more detail"
    end

    it "has 'aria-describedby' the error message id" do
      error_id = css_select(".govuk-error-message").attr("id")

      assert_select ".govuk-textarea[aria-describedby='#{error_id}']"
    end
  end

  context "when error_items are provided" do
    before do
      render_component(
        name: "more-detail-hint-error-message",
        error_items: [
          {
            text: "Error item 1"
          }
        ]
      )
    end

    it "renders the error message" do
      assert_select ".gem-c-error-summary li", text: "Error item 1"
    end

    it "has 'aria-describedby' the error message id" do
      error_id = css_select(".gem-c-error-summary").attr("id")

      assert_select ".govuk-textarea[aria-describedby='#{error_id}']"
    end
  end
end
