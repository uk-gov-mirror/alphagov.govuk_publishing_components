/* eslint-env jquery */

window.GOVUK = window.GOVUK || {}
window.GOVUK.Modules = window.GOVUK.Modules || {};

(function (Modules) {
  'use strict'

  Modules.Feedback = function () {
    this.start = function ($element) {
      this.element = $element[0]
      this.somethingIsWrongForm = document.getElementById('something-is-wrong')
      this.surveyForm = document.getElementById('page-is-not-useful')
      this.prompt = this.element.querySelector('.js-prompt')
      this.forms = this.element.getElementsByClassName('js-feedback-form')
      this.toggleForms = this.element.querySelectorAll('.js-toggle-form')
      this.closeForms = this.element.querySelectorAll('.js-close-form')
      this.activeForm = false
      this.pageIsUsefulButton = this.element.querySelector('.js-page-is-useful')
      this.pageIsNotUsefulButton = this.element.querySelector('.js-page-is-not-useful')
      this.somethingIsWrongButton = this.element.querySelector('.js-something-is-wrong')
      this.promptQuestions = this.element.querySelector('.js-prompt-questions')
      this.promptSuccessMessage = this.element.querySelector('.js-prompt-success')
      this.surveyWrapper = document.getElementById('survey-wrapper')

      var that = this
      var jshiddenClass = 'js-hidden'

      setInitialAriaAttributes()
      setHiddenValues()

      for (var i = 0; i < this.toggleForms.length; i++) {
        this.toggleForms[i].addEventListener('click', function (e) {
          e.preventDefault()
          toggleForm(e.target.getAttribute('aria-controls'))
          trackEvent(getTrackEventParams(this))
          updateAriaAttributes(this)
        })
      }
      for (var i = 0; i < this.closeForms.length; i++) {
        this.closeForms[i].addEventListener('click', function (e) {
          e.preventDefault()
          toggleForm(e.target.getAttribute('aria-controls'))
          trackEvent(getTrackEventParams(this))
          setInitialAriaAttributes()
          revealInitialPrompt()
          var refocusClass = '.js-' + e.target.getAttribute('aria-controls')
          $element.find(refocusClass).focus()
        })
      }

      this.pageIsUsefulButton.addEventListener('click', function (e) {
        e.preventDefault()
        trackEvent(getTrackEventParams(that.pageIsUsefulButton))
        showFormSuccess()
        revealInitialPrompt()
      })

      this.pageIsNotUsefulButton.addEventListener('click', function (e) {
        var gaClientId
        var dummyGaClientId = '111111111.1111111111'
        if (window.GOVUK.cookie('_ga') === null || window.GOVUK.cookie('_ga') === '') {
          gaClientId = dummyGaClientId
        } else {
          gaClientId = window.GOVUK.cookie('_ga').split('.').slice(-2).join('.')
        }
        setHiddenValuesNotUsefulForm(gaClientId)
      })
      for (var i = 0; i < that.forms.length; i++) {
        var thisForm = that.forms[i]
        thisForm.addEventListener('submit', function(e) {
          e.preventDefault()
          disableSubmitFormButton(this)
          function urlencodeFormData(fd){
            var s = '';
            function encode(s){ return encodeURIComponent(s).replace(/%20/g,'+'); }
            for(var pair of fd.entries()){
                if(typeof pair[1]=='string'){
                    s += (s?'&':'') + encode(pair[0])+'='+encode(pair[1]);
                }
            }
            return s;
          }
          var xhr = new XMLHttpRequest()
          var formData = urlencodeFormData(new FormData(thisForm))
          xhr.open('POST',this.getAttribute('action'))
          xhr.timeout = 6000
          xhr.setRequestHeader('Accept', 'application/json, text/javascript, */*')
          xhr.setRequestHeader('x-requested-with', 'XMLHttpRequest')
          xhr.send(formData)
          xhr.onload = function () {
            console.log(xhr.response)
            console.log(xhr.responseText)
            console.log(xhr.responseType)
            if (xhr.status === 200) {
              trackEvent(getTrackEventParams(thisForm))
              showFormSuccess(xhr.response)
              console.log(xhr.response)
              revealInitialPrompt()
              setInitialAriaAttributes()
              that.activeForm.classList.contains(jshiddenClass) ? that.activeForm.classList.remove(jshiddenClass) : that.activeForm.classList.add(jshiddenClass)
            } else {
              showError(xhr.response)
              enableSubmitFormButton(thisForm)
            }
          }
          xhr.addEventListener("error", function () {
            showError(xhr.response)
            enableSubmitFormButton(thisForm)
          })
          // $.ajax({
          //   type: 'POST',
          //   url: this.getAttribute('action'),
          //   dataType: 'json',
          //   data: formData,
          //   beforeSend: disableSubmitFormButton(this),
          //   timeout: 6000
          // }).done(function (xhr) {
          //   trackEvent(getTrackEventParams(this))
          //   showFormSuccess(xhr.message)
          //   revealInitialPrompt()
          //   setInitialAriaAttributes()
          //   that.activeForm.classList.contains(jshiddenClass) ? that.activeForm.classList.remove(jshiddenClass) : that.activeForm.classList.add(jshiddenClass)
          // }).fail(function (xhr) {
          //   showError(xhr)
          //   enableSubmitFormButton(this)
          // })
        })
      }

      function disableSubmitFormButton (form) {
        form.querySelector('[type="submit"]').setAttribute('disabled', true)
      }

      function enableSubmitFormButton (form) {
        form.querySelector('[type="submit"]').removeAttribute('disabled')
      }

      function setInitialAriaAttributes () {
        for (var i = 0; i < that.forms.length; i++) {
          that.forms[i].setAttribute('aria-hidden', true)
        }
        that.pageIsNotUsefulButton.setAttribute('aria-expanded', false)
        that.somethingIsWrongButton.setAttribute('aria-expanded', false)
      }

      function setHiddenValues () {
        var jsEnabledInput = document.createElement('input')
        var referrerInput = document.createElement('input')
        jsEnabledInput.setAttribute('type', 'hidden')
        jsEnabledInput.setAttribute('name', 'javascript_enabled')
        jsEnabledInput.value = true
        referrerInput.setAttribute('type', 'hidden')
        referrerInput.setAttribute('name', 'referrer')
        referrerInput.value = document.referrer || 'unknown'
        that.somethingIsWrongForm.appendChild(jsEnabledInput)
        that.somethingIsWrongForm.appendChild(referrerInput)
        that.somethingIsWrongForm.invalidInfoError = [
          '<h2>',
          '  Sorry, we’re unable to send your message as you haven’t given us any information.',
          '</h2>',
          '<p>Please tell us what you were doing or what went wrong</p>'
        ].join('')
      }

      function setHiddenValuesNotUsefulForm (gaClientId) {
        var currentPathName = window.location.pathname.replace(/[^\s=?&]+(?:@|%40)[^\s=?&]+/, '[email]')
        var finalPathName = encodeURI(currentPathName)
        var emailSurveySignupInput = document.createElement('input')
        emailSurveySignupInput.setAttribute('type','hidden')
        emailSurveySignupInput.setAttribute('name','email_survey_signup[ga_client_id]')
        emailSurveySignupInput.value = gaClientId || '0'
        var smartSurveyLink = document.createElement('a')
        smartSurveyLink.href = "https://www.smartsurvey.co.uk/s/gov-uk-banner/?c=" + finalPathName + "&amp;gcl=" + gaClientId
        smartSurveyLink.class = "gem-c-feedback__email-link govuk-link"
        smartSurveyLink.id = "take-survey"
        smartSurveyLink.setAttribute('target', '_blank')
        smartSurveyLink.setAttribute('rel', 'noopener noreferrer')
        smartSurveyLink.innerText = "Don’t have an email address?"

        that.surveyForm.invalidInfoError = [
          '<h2>',
          '  Sorry, we’re unable to send your message as you haven’t given us a valid email address. ',
          '</h2>',
          '<p>Enter an email address in the correct format, like name@example.com</p>'
        ].join('')
        if (document.querySelectorAll('[name="email_survey_signup[ga_client_id]"]').length === 0) {
          that.surveyForm.appendChild(emailSurveySignupInput)
        }

        if (document.querySelectorAll('.gem-c-feedback__email-link#take-survey').length === 0) {
          that.surveyWrapper.appendChild(smartSurveyLink)
        }
      }

      function updateAriaAttributes (linkClicked) {
        linkClicked.setAttribute('aria-expanded', true)
        document.getElementById(linkClicked.getAttribute('aria-controls')).setAttribute('aria-hidden', false)
      }

      function toggleForm (formId) {
        that.activeForm = document.getElementById(formId)
        that.activeForm.classList.contains(jshiddenClass) ? that.activeForm.classList.remove(jshiddenClass) : that.activeForm.classList.add(jshiddenClass)
        that.prompt.classList.contains(jshiddenClass) ? that.prompt.classList.remove(jshiddenClass) : that.prompt.classList.add(jshiddenClass)

        var formIsVisible = !that.activeForm.classList.contains(jshiddenClass)

        if (formIsVisible) {
          that.activeForm.querySelector('.gem-c-input').focus()
        } else {
          that.activeForm = false
        }
      }

      function getTrackEventParams (element) {
        return {
          category: element.getAttribute('data-track-category'),
          action: element.getAttribute('data-track-action')
        }
      }

      function trackEvent (trackEventParams) {
        if (window.GOVUK.analytics && window.GOVUK.analytics.trackEvent) {
          window.GOVUK.analytics.trackEvent(trackEventParams.category, trackEventParams.action)
        }
      }

      function showError (error) {
        var genericError = [
          '<h2>',
          '  Sorry, we’re unable to receive your message right now. ',
          '</h2>',
          '<p>If the problem persists, we have other ways for you to provide',
          ' feedback on the <a href="/contact/govuk">contact page</a>.</p>'
        ].join('')
        // if the response is not a 404 or 500, show the error message if it exists
        // otherwise show the generic message
        if (typeof (error.responseJSON) !== 'undefined') {
          error = typeof (error.responseJSON.message) === 'undefined' ? genericError : error.responseJSON.message

          if (error === 'email survey sign up failure') {
            error = genericError
          }
        } else if (error.status === 422) {
          // there's clobbering by nginx on all 422 requests, which is why the response returns a rendered html page instead of the expected JSON
          // this is a temporary workaround to ensure that are are displaying relevant error messages to the users
          error = that.activeForm.invalidInfoError || genericError
        } else {
          // for all other, show generic error
          error = genericError
        }
        var errors = that.activeForm.getElementsByClassName('js-errors')
        for (var i = 0; i < errors.length; i++) {
          errors[i].innerHTML = error
          errors[i].classList.remove(jshiddenClass)
          errors[i].focus()
        }
      }

      function showFormSuccess () {
        that.promptQuestions.classList.add(jshiddenClass)
        that.promptSuccessMessage.classList.remove(jshiddenClass)
        that.promptSuccessMessage.focus()
      }

      function revealInitialPrompt () {
        that.prompt.classList.remove(jshiddenClass)
        that.prompt.focus()
      }
    }
  }
})(window.GOVUK.Modules)
