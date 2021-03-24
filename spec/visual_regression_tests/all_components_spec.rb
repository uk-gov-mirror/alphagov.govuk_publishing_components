require "rails_helper"
require "percy"
require "uri"

describe "visual regression test runner Percy", visual_regression: true do
  it "takes a screenshot of each component" do
    # Freeze time for transition countdown
    travel_to(Time.zone.local(2020, 12, 1, 6, 0, 0))

    visit("/component-guide")

    component_links = find("#list-all-components-in-the-gem")
      .all("a")
      .map do |link|
        URI(link[:href] + "/preview")
      end

    # The public layout component has two previews - one with multiple versions
    # as part of the component guide, and another one at `/public`.
    component_links << URI("/public")

    component_links.each do |link|
      skip_as_govspeak_times_out = [
        "/component-guide/govspeak/preview",
      ]

      skip_non_visible_components = [
        "/component-guide/meta_tags/preview",
        "/component-guide/machine_readable_metadata/preview",
        "/component-guide/admin_analytics/preview",
        "/component-guide/google_tag_manager_script/preview",
        "/component-guide/layout_for_admin/preview",
      ]

      all_components_to_skip = skip_as_govspeak_times_out + skip_non_visible_components

      next if all_components_to_skip.include?(link.path)
      visit(link)
      name = title.gsub(/(: Default|) preview - Component Guide/, "")
      page.find(:css, "body > #wrapper", wait: 10)
      Percy.snapshot(page, name: name)
    end
  end
end
