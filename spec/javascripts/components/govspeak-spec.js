/* eslint-env jasmine, jquery */
/* global GOVUK */

describe('Govspeak', function () {
  var govspeakModule = new GOVUK.Modules.Govspeak()

  describe('youtube enhancement', function () {
    var container

    beforeEach(function () {
      // For some reason, JSON.parse on the cookie works in the browser, but fails in Jasmine tests.
      // It seems to be due to extra escaping of quotes when the code is run in the tests, which means JSON.parse doesn't
      // work as expected. So we'll stub this value instead.
      spyOn(JSON, 'parse').and.returnValue({
        'essential': true,
        'settings': true,
        'usage': true
      })
      window.GOVUK.cookie('cookie_policy', null)
    })

    afterEach(function () {
      document.body.removeChild(container)
    })

    it('embeds youtube videos', function () {
      container = document.createElement('div')
      container.innerHTML =
        '<div class="gem-c-govspeak govuk-govspeak" data-module="govspeak">' +
          '<p><a href="https://www.youtube.com/watch?v=0XpAtr24uUQ">Agile at GDS</a></p>' +
        '<div>'
      document.body.appendChild(container)

      var element = document.querySelector('.gem-c-govspeak')
      govspeakModule.start($(element))

      expect(document.querySelectorAll('.youtube-video-container').length).toBe(1)
      expect(document.querySelectorAll("[id^='0XpAtr24uUQ']").length).toBe(1)
    })

    it('allows disabling embeds of youtube videos', function () {
      container = document.createElement('div')
      container.innerHTML =
        '<div class="gem-c-govspeak govuk-govspeak disable-youtube" data-module="govspeak">' +
          '<p><a href="https://www.youtube.com/watch?v=0XpAtr24uUQ">Agile at GDS</a></p>' +
        '<div>'
      document.body.appendChild(container)

      var element = document.querySelector('.gem-c-govspeak')
      govspeakModule.start($(element))

      expect(document.querySelectorAll('.youtube-video-container').length).toBe(0)
      expect(document.querySelectorAll("[id^='0XpAtr24uUQ']").length).toBe(0)
    })
  })

  describe('barchart enhancement', function () {
    it('embeds barcharts', function () {
      var $element = $(
        '<div id="govspeak-barchart" class="gem-c-govspeak govuk-govspeak" data-module="govspeak">' +
          '<table class="js-barchart-table mc-auto-outdent">' +
            '<tbody>' +
              '<tr>' +
                '<td>row 1</td><td>10</td>' +
              '</tr>' +
            '</tbody>' +
          '</table>' +
        '<div>'
      )
      govspeakModule.start($element)
      expect($element.find('.mc-chart').length).toBe(1)
    })
  })
})
