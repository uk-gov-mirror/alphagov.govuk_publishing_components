(function () {
  'use strict'
  window.GOVUK = window.GOVUK || {}

  var YoutubeLinkEnhancement = function ($element) {
    this.$element = $element
    // store details of all the videos from the page
    this.playList = []
    // store all youtube player objects
    this.players = []
  }

  YoutubeLinkEnhancement.prototype.init = function () {
    var $youtubeLinks = this.$element[0].querySelectorAll('a[href*="youtube.com"], a[href*="youtu.be"]')
    var _this = this
    var apiScriptInserted = false

    for (var i = 0; i < $youtubeLinks.length; ++i) {
      var $link = $youtubeLinks[i]

      // if users have disabled 'campaigns' cookie in the new cookie page settings
      // we also need to disable the youtube video embed
      if (_this.hasDisabledEmbed($link) || !YoutubeLinkEnhancement.campaignCookies()) {
        return true
      }
      // insert script only once, but only if a video in the list is set to embed
      // and campaign cookies are enabled
      if (!apiScriptInserted) {
        insertApiScript(this.playList, this.players)
        apiScriptInserted = true
      }
      var videoId = YoutubeLinkEnhancement.parseVideoId($link.getAttribute('href'))
      if (videoId) {
        _this.setupVideo($link, videoId)
      }
    }
  }

  var playerApiReady = function (playList, players) {
    // youtube iframe api is very pick about knowing when it's ready,
    // so they want this function to be on the window object
    window.onYouTubePlayerAPIReady = function () {
      // youtube API provides the variable when it is definitely ready
      for (var i = 0; i < playList.length; i++) {
        var currentPlayer = createVideoPlayer(playList[i])
        players[i] = currentPlayer
      }
    }
  }

  var insertApiScript = function (playList, players) {
    var tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/player_api'
    var firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)

    playerApiReady(playList, players)
  }

  YoutubeLinkEnhancement.prototype.hasDisabledEmbed = function ($link) {
    return $link.getAttribute('data-youtube-player') === 'off'
  }

  YoutubeLinkEnhancement.prototype.setupVideo = function ($link, videoId) {
    // Handle if the same video is inserted into the page more than once
    var videoWrapperId = videoId + Math.random().toString()

    var parentPara = $link.parentNode
    var parentContainer = parentPara.parentNode

    var youtubeVideoContainer = document.createElement('div')
    youtubeVideoContainer.className += 'youtube-video-container'
    youtubeVideoContainer.innerHTML = '<span id="' + videoWrapperId + '"></span>'

    parentContainer.replaceChild(youtubeVideoContainer, parentPara)
    this.playList.push({
      id: videoWrapperId,
      videoId: videoId,
      title: $link.textContent
    })
  }

  var createVideoPlayer = function (playlistItem) {
    return new window.YT.Player(playlistItem.id, {
      videoId: playlistItem.videoId,
      host: 'https://www.youtube-nocookie.com',
      playerVars: {
        // enables the player to be controlled via IFrame or JavaScript Player API calls
        enablejsapi: 1,
        // don't show related videos
        rel: 0,
        // disable option to allow single key shortcuts due to (WCAG SC 2.1.4)
        // https://www.w3.org/WAI/WCAG21/quickref/#character-key-shortcuts
        disablekb: 1,
        // prevent the YouTube logo from displaying in the control bar
        modestbranding: 1
      },
      events: {
        'onReady': function (event) {
          // update iframe title attribute once video is ready
          event.target.a.setAttribute('title', playlistItem.title)
        }
      }
    })
  }

  YoutubeLinkEnhancement.prototype.protocol = function () {
    var scheme = document.location.protocol
    if (scheme === 'file:') {
      scheme = 'https:'
    }
    return scheme
  }

  YoutubeLinkEnhancement.campaignCookies = function () {
    var cookiePolicy = window.GOVUK.getConsentCookie()
    return cookiePolicy !== null ? cookiePolicy.campaigns : true
  }

  YoutubeLinkEnhancement.nextId = function () {
    this.embedCount = this.embedCount || 0
    this.embedCount += 1
    return 'youtube-' + this.embedCount
  }

  // This is a public class method so it can be used outside of this embed to
  // check that user input for videos will be supported in govspeak
  YoutubeLinkEnhancement.parseVideoId = function (url) {
    var parts

    if (url.indexOf('youtube.com') > -1) {
      var params = {}
      parts = url.split('?')
      if (parts.length === 1) {
        return
      }
      parts = parts[1].split('&')
      for (var i = 0; i < parts.length; i++) {
        var part = parts[i].split('=')
        params[part[0]] = part[1]
      }
      return params.v
    }

    if (url.indexOf('youtu.be') > -1) {
      parts = url.split('/')
      return parts.pop()
    }
  }

  window.GOVUK.GovspeakYoutubeLinkEnhancement = YoutubeLinkEnhancement
})(window.GOVUK)
