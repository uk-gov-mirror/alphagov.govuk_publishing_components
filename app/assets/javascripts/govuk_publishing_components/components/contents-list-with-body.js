/* global IntersectionObserver */
(function (Modules) {
  class ContentsListWithBody {
    constructor ($module) {
      /** @type {HTMLElement} */
      this.$module = $module

      /** @type {HTMLElement | null} */
      this.stickyElement = this.$module.querySelector('[data-sticky-element]')

      /** @type {HTMLDivElement | null} */
      this.topSentinel = this.$module.querySelector('.gem-c-contents-list-with-body__list-container')

      /** @type {HTMLDivElement | null} */
      this.bottomSentinel = null

      /** @type {IntersectionObserver | null} */
      this.topObserver = null

      /** @type {IntersectionObserver | null} */
      this.bottomObserver = null

      /** @type {string} */
      this.enabledClass = 'gem-c-contents-list-with-body__sticky-element--enabled'

      /** @type {string} */
      this.stuckToWindowClass = 'gem-c-contents-list-with-body__sticky-element--stuck-to-window'

      /** @type {string} */
      this.hiddenClass = 'gem-c-contents-list-with-body__sticky-element--hidden'
    }

    /**
     * Initialise the contents list with body component
     */
    init () {
      if (!this.stickyElement || !this.topSentinel) return

      // Ensure the sticky element starts hidden before we check for intersection observer support
      this.stickyElement.classList.add(this.hiddenClass)

      if (!('IntersectionObserver' in window)) {
        return
      }

      this.stickyElement.classList.add(this.enabledClass)
      this.createBottomSentinel()
      this.setupObservers()
    }

    /**
     * Create and insert a bottom sentinel tripwire onto the page before the sticky element.
     * This is used to determine when the sticky element should be docked to the bottom of the parent container instead of sticking to the window.
     * This method remains agnostic as to the content in the main page content.
     */
    createBottomSentinel () {
      this.bottomSentinel = document.createElement('div')
      this.bottomSentinel.className = 'gem-c-contents-list-with-body__bottom-sentinel'
      this.bottomSentinel.setAttribute('aria-hidden', 'true')
      this.bottomSentinel.style.cssText = 'height: 1px; width: 100%; pointer-events: none; visibility: hidden;'

      if (this.stickyElement?.parentNode) this.stickyElement.parentNode?.insertBefore(this.bottomSentinel, this.stickyElement)
    }

    /**
     * Set up IntersectionObservers to monitor top and bottom boundaries
     */
    setupObservers () {
      this.topObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          // Handle showing/hiding the sticky element based on the contents block position.
          // !entry.isIntersecting: Element is completely outside the viewport
          // entry.boundingClientRect.top < 0: Coordinates become negative when scrolled off the top of the screen
          // Required for initial load (e.g. mobile with tall header content) where isIntersecting is false
          // because the contents have not yet entered the viewport from below
          const isPastContents = !entry.isIntersecting && entry.boundingClientRect.top < 0

          isPastContents ? this.stickyElement?.classList.remove(this.hiddenClass) : this.stickyElement?.classList.add(this.hiddenClass)
        })
      })

      this.bottomObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          // Handle sticking to the viewport or docking to the bottom of the parent container based on the bottom sentinel position.
          // entry.boundingClientRect.top <= window.innerHeight: True when the sentinel has reached the bottom of the screen
          // or scrolled past above it (e.g. deep into in the footer)
          const isAtBottom = entry.boundingClientRect.top <= window.innerHeight

          isAtBottom ? this.stickyElement?.classList.remove(this.stuckToWindowClass) : this.stickyElement?.classList.add(this.stuckToWindowClass)
        })
      })

      if (this.topSentinel && this.bottomSentinel) {
        this.topObserver.observe(this.topSentinel)
        this.bottomObserver.observe(this.bottomSentinel)
      }
    }
  }

  Modules.ContentsListWithBody = ContentsListWithBody
})(window.GOVUK.Modules)

/**
 * @see {@link https://components.publishing.service.gov.uk/component-guide/contents_list_with_body}
 */
