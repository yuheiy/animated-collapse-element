const DEFAULT_DURATION_EXPAND = '0.25s'
const DEFAULT_DURATION_COLLAPSE = '0.2s'
const DEFAULT_EASING_EXPAND = 'cubic-bezier(0.4, 0, 0.2, 1)'
const DEFAULT_EASING_COLLAPSE = 'cubic-bezier(0.4, 0, 0.2, 1)'

export default class AnimatedCollapse extends HTMLElement {
  static get observedAttributes() {
    return ['expanded']
  }

  static get is() {
    return 'animated-collapse'
  }

  set expanded(val) {
    if (val) {
      this.setAttribute('expanded', '')
    } else {
      this.removeAttribute('expanded')
    }
  }

  get expanded() {
    return this.hasAttribute('expanded')
  }

  constructor() {
    super()
    this.attachShadow({
      mode: 'open',
    }).innerHTML =
      '<style>:host(:not([hidden])){display:block}</style>' +
      '<div id="wrapper"><slot></slot></div>'

    this._state = this.expanded ? 'expanded' : 'collapsed' // 'expanding' | 'expanded' | 'collapsing' | 'collapsed'
    this._transitionCallback = null
  }

  connectedCallback() {
    const wrapperEl = this.shadowRoot.querySelector('#wrapper')

    if (!this.expanded) {
      const wrapperStyle = wrapperEl.style
      wrapperStyle.overflow = 'hidden'
      wrapperStyle.height = '0px'
      wrapperStyle.visibility = 'hidden'
    }

    wrapperEl.addEventListener(
      'transitionend',
      this._onTransitionEnd.bind(this),
    )
  }

  attributeChangedCallback() {
    if (this.expanded) {
      this._expand()
    } else {
      this._collapse()
    }
  }

  _expand() {
    if (['expanding', 'expanded'].includes(this._state)) {
      return
    }

    const wrapperEl = this.shadowRoot.querySelector('#wrapper')
    const wrapperStyle = wrapperEl.style
    wrapperStyle.height = `${wrapperEl.scrollHeight}px`
    wrapperStyle.visibility = ''
    wrapperStyle.transition =
      'height' +
      ` var(--animated-collapse-duration-expand, ${DEFAULT_DURATION_EXPAND})` +
      ` var(--animated-collapse-easing-expand, ${DEFAULT_EASING_EXPAND})`
    this._state = 'expanding'
    this.dispatchEvent(new CustomEvent('expandstart'))

    this._transitionCallback = () => {
      wrapperStyle.transition = wrapperStyle.overflow = wrapperStyle.height = ''
      this._state = 'expanded'
      this.dispatchEvent(new CustomEvent('expandend'))
    }
  }

  _collapse() {
    if (['collapsing', 'collapsed'].includes(this._state)) {
      return
    }

    const wrapperEl = this.shadowRoot.querySelector('#wrapper')
    const wrapperStyle = wrapperEl.style
    wrapperStyle.overflow = 'hidden'
    wrapperStyle.height = `${wrapperEl.scrollHeight}px`
    wrapperStyle.transition =
      'height' +
      ` var(--animated-collapse-duration-collapse, ${DEFAULT_DURATION_COLLAPSE})` +
      ` var(--animated-collapse-easing-collapse, ${DEFAULT_EASING_COLLAPSE})`
    wrapperEl.scrollHeight // force layout
    wrapperStyle.height = '0px'
    this._state = 'collapsing'
    this.dispatchEvent(new CustomEvent('collapsestart'))

    this._transitionCallback = () => {
      wrapperStyle.visibility = 'hidden'
      wrapperStyle.transition = ''
      this._state = 'collapsed'
      this.dispatchEvent(new CustomEvent('collapseend'))
    }
  }

  _onTransitionEnd() {
    if (this._transitionCallback) {
      this._transitionCallback()
      this._transitionCallback = null
    }
  }
}
