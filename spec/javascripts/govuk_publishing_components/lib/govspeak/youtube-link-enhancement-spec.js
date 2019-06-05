describe('Youtube link enhancement', function () {
  describe('default behaviour and no consent', function () {
    var container

    beforeEach(function () {
      container = document.createElement('div')

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

    afterEach(function() {
      document.body.removeChild(container)
    })

    it('replaces a link and it\'s container with a media-player embed', function () {
      container.innerHTML =
        '<div class="gem-c-govspeak govuk-govspeak" data-module="govspeak">' +
          '<p><a href="https://www.youtube.com/watch?v=0XpAtr24uUQ">Agile at GDS</a></p>' +
        '<div>'
      document.body.appendChild(container)

      var element = document.querySelectorAll('.gem-c-govspeak')
      var enhancement = new GOVUK.GovspeakYoutubeLinkEnhancement($(element))
      enhancement.init()

      expect(document.querySelectorAll('.youtube-video-container [id="0XpAtr24uUQ"]').length).toBe(1)
      expect(document.querySelectorAll('[id="0XpAtr24uUQ"] p, [id="0XpAtr24uUQ"] a').length).toBe(0)
    })

    it('doesn\'t replace non Youtube links', function () {
      container.innerHTML =
        '<div class="gem-c-govspeak govuk-govspeak" data-module="govspeak">' +
          '<p><a href="https://www.gov.uk">GOV.UK</a></p>' +
        '<div>'
      document.body.appendChild(container)

      var element = document.querySelectorAll('.gem-c-govspeak')
      var enhancement = new GOVUK.GovspeakYoutubeLinkEnhancement($(element))
      enhancement.init()

      expect(document.querySelectorAll('.youtube-video-container iframe').length).toBe(0)
      expect(document.querySelectorAll('.gem-c-govspeak p, .gem-c-govspeak a').length).toBe(2)
    })

    it('doesn\'t replace links marked not to embed', function () {
      container.innerHTML = '<div class="gem-c-govspeak"><p><a href="https://www.youtube.com/watch?v=0XpAtr24uUQ" data-youtube-player="off">Agile at GDS</a></p></div>'
      document.body.appendChild(container)

      var element = document.querySelectorAll('.gem-c-govspeak')
      var enhancement = new GOVUK.GovspeakYoutubeLinkEnhancement($(element))
      enhancement.init()

      expect(document.querySelectorAll('.youtube-video-container [id="0XpAtr24uUQ"]').length).toBe(0)
      expect(document.querySelectorAll('.gem-c-govspeak p, .gem-c-govspeak a').length).toBe(2)
    })
  })

  describe('parseVideoId', function () {
    it('returns an id for a youtube.com video URL', function () {
      var url = 'https://www.youtube.com/watch?v=0XpAtr24uUQ'
      var id = GOVUK.GovspeakYoutubeLinkEnhancement.parseVideoId(url)

      expect(id).toEqual('0XpAtr24uUQ')
    })

    it('returns an id for a youtu.be video URL', function () {
      var url = 'https://youtu.be/0XpAtr24uUQ'
      var id = GOVUK.GovspeakYoutubeLinkEnhancement.parseVideoId(url)

      expect(id).toEqual('0XpAtr24uUQ')
    })

    it('doesn\'t return an id for a Youtube non video', function () {
      var url = 'https://www.youtube.com/channel/UCSNK6abAoM6Kj0SkHOStNLg'
      var id = GOVUK.GovspeakYoutubeLinkEnhancement.parseVideoId(url)

      expect(id).not.toBeDefined()
    })

    it('doesn\'t return an id for a non youtube link', function () {
      var url = 'https://www.gov.uk'
      var id = GOVUK.GovspeakYoutubeLinkEnhancement.parseVideoId(url)

      expect(id).not.toBeDefined()
    })
  })

  describe('cookie consent for campaign true', function () {
    var container

    beforeEach(function () {
      container = document.createElement('div')
      container.innerHTML =
        '<div class="gem-c-govspeak govuk-govspeak" data-module="govspeak">' +
          '<p><a href="https://www.youtube.com/watch?v=0XpAtr24uUQ">Agile at GDS</a></p>' +
        '<div>'
      document.body.appendChild(container)

      // For some reason, JSON.parse on the cookie works in the browser, but fails in Jasmine tests.
      // It seems to be due to extra escaping of quotes when the code is run in the tests, which means JSON.parse doesn't
      // work as expected. So we'll stub this value instead.
      spyOn(JSON, 'parse').and.returnValue({
        'campaigns': true
      })
      window.GOVUK.cookie('cookie_policy', "{\"campaigns\":true}")
    })

    afterEach(function() {
      document.body.removeChild(container)
    })

    it('replaces a link and its container with a media-player embed when campaign cookies are turned on', function () {
      var element = document.querySelectorAll('.gem-c-govspeak')
      var enhancement = new GOVUK.GovspeakYoutubeLinkEnhancement($(element))
      enhancement.init()

      expect(document.querySelectorAll('.youtube-video-container [id="0XpAtr24uUQ"]').length).toBe(1)
      expect(document.querySelectorAll('[id="0XpAtr24uUQ"] p, [id="0XpAtr24uUQ"] a').length).toBe(0)
    })
  })

  describe('cookie consent for campaign set to false', function () {
    beforeEach(function () {
      window.GOVUK.cookie('cookie_policy', "{\"campaigns\":false}")
    })

    it('doesn\'t replace links when campaign cookies are turned off', function () {
      var $element = $('<div><p><a href="https://www.youtube.com/watch?v=0XpAtr24uUQ">Agile at GDS</a></p></div>')
      var $toReplace = $element.find('p, a')
      var enhancement = new GOVUK.GovspeakYoutubeLinkEnhancement($element)
      enhancement.init()

      expect($element.find('.youtube-video-container iframe').length).toBe(0)
      expect($element.find($toReplace).length).toBe(2)
    })
  })
})
