// = require_tree ./lib
// = require_tree ./components
/* = require govuk/all.js */

// Initialise all GOVUKFrontend components
// window.GOVUKFrontend.initAll()


// var notGOVUKFrontend = {}
console.log('seriously?')
// = require govuk/components/character-count/character-count.js
console.log(window.GOVUKFrontend)
// notGOVUKFrontend.CharacterCount = window.GOVUKFrontend
var CharacterCount = window.GOVUKFrontend.CharacterCount
console.log(CharacterCount)
var $characterCount = document.querySelector('[data-module="govuk-character-count"]')
if ($characterCount) {
  new CharacterCount($characterCount).init()
}

/* // = require govuk/components/radios/radios.js */
// console.log(window.GOVUKFrontend)
var Radios = window.GOVUKFrontend.Radios
// console.log(Radios)
var $radio = document.querySelector('[data-module="govuk-radios"]')
if ($radio) {
  new Radios($radio).init()
}
