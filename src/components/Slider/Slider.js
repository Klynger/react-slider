import React, { Children, Component, cloneElement } from 'react'
// import debounce from 'debounce'
import PropTypes from 'prop-types'
import transformProperty from '../../utils/transformProperty'

/**
 * I got copy this.innerElements[this.innerElements.length - this.perPage : this.innerElements.length] and
 * this.innerElements[0 : this.perPage], then I append the last elements that I copy, then original elements, then
 * the first elements that I copy ex: if I have 1 2 3 4 5 and show 2 elements per page I will have 4 5 1 2 3 4 5 1 2.
 * To make it work I gonna have to show children first, after things start I gonna have to change it and show all the 
 * elements with copies
 */
export default class Slider extends Component {
  static propTypes = {
    resizeDebounce: PropTypes.number,
    duration: PropTypes.number,
    easing: PropTypes.string,
    perPage: PropTypes.number,
    startIndex: PropTypes.number,
    draggable: PropTypes.bool,
    threshold: PropTypes.number,
    loop: PropTypes.bool,
    children: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.arrayOf(PropTypes.element)
    ]),
    onInit: PropTypes.func,
    onChange: PropTypes.func,
  }

  static defaultProps = {
    resizeDebounce: 250,
    duration: 200,
    easing: 'ease-out',
    perPage: 2,
    startIndex: 0,
    draggable: true,
    threshold: 20,
    loop: false,
    onInit: () => { },
    onChange: () => { }
  }

  static events = ['onMouseUp', 'onMouseDown', 'onMouseLeave', 'onMouseMove']

  constructor(props) {
    super(props)

    this.drag = {
      startX: 0,
      endX: 0,
      startY: 0,
      letItGo: null
    }

    this.currentSlide = props.startIndex
  }

  componentDidMount() {
    this.init()

    // this.onResize = debounce(() => {
    //   this.resize()
    //   this.slideToCurrent()
    // }, this.props.resizeDebounce)

    // window.addEventListener('resize', this.onResize)
  }

  componentDidUpdate() {
    this.init()
  }

  getStylingTransition = (easing, duration = 0) => ({
    webkitTransition: `all ${duration}ms ${easing}`,
      transition: `all ${duration}ms ${easing}`
  })

  enableTransition = (extraStyles = {}) => {
    const { easing, duration } = this.props

    this.setStyle(this.sliderFrame, {
      ...this.getStylingTransition(easing, duration),
      ...extraStyles
    })
  }

  disableTransition = (extraStyles = {}) => {
    const { easing } = this.props
    this.setStyle(this.sliderFrame, {
      ...this.getStylingTransition(easing),
      ...extraStyles
    })
  }

  init = () => {
    const { draggable } = this.props
    this.setSelectorWidth()
    this.setInnerElements()
    this.resolveSlidesNumber()
    this.enableTransition({
      width: `${(this.selectorWidth / this.perPage) * this.innerElements.length}px`,
      ...(draggable ? { cursor: '-webkit-grab' } : {}),
    })

    this.innerElements.forEach(el => {
      this.setStyle(el, {
        width: `${100 / this.innerElements.length}%`
      })
    })

    this.slideToCurrent()
    this.props.onInit.call(this)
  }

  // componentWillUnmount() {
    // window.removeEventListener('resize', this.onResize)
  // }

  setSelectorWidth = () => {
    this.selectorWidth = this.selector.getBoundingClientRect().width
  }

  setInnerElements = () => {
    this.innerElements = [].slice.call(this.sliderFrame.children)
  }

  resolveSlidesNumber = () => {
    if (typeof this.props.perPage === 'number') {
      this.perPage = this.props.perPage
    } else if (typeof this.props.perPage === 'object') {
      this.perPage = 1
      if (window) {
        for (const viewport in this.props.perPage) {
          if (window.innerWidth >= viewport) {
            this.perPage = this.props.perPage[viewport]
          }
        }
      }
    }
  }

  prev = (howManySlides = 1) => {
    if (this.innerElements.length <= this.perPage) {
      return
    }

    const { loop, draggable } = this.props
    const beforeChange = this.currentSlide

    if (loop) {
      const isNewIndexClone = this.currentSlide - howManySlides < 0
      if (isNewIndexClone) {
        this.disableTransition()

        const mirrorSlideIndex = this.currentSlide + this.innerElements.length - (2 * this.perPage)
        const mirrorSlideIndexOffset = this.perPage
        const moveTo = mirrorSlideIndex + mirrorSlideIndexOffset
        const offset = -1 * moveTo * (this.selectorWidth / this.perPage)
        const dragDistance = draggable ? this.drag.endX - this.drag.startX : 0

        this.sliderFrame.style[transformProperty] = `translate3d(${offset + dragDistance}px, 0, 0)`
        this.currentSlide = mirrorSlideIndex - howManySlides
      } else {
        this.currentSlide -= howManySlides
      }
    } else {
      this.currentSlide = Math.max(this.currentSlide - howManySlides, 0)
    }

    if (beforeChange !== this.currentSlide) {
      this.slideToCurrent(loop)
    }
  }

  next = (howManySlides = 1) => {
    if (this.innerElements.length <= this.perPage) {
      return
    }

    const beforeChange = this.currentSlide
    const { loop, draggable } = this.props

    if (loop) {
      const isNewIndexClone = this.currentSlide + howManySlides > this.innerElements.length - (3 * this.perPage)
      if (isNewIndexClone) {
        this.disableTransition()

        const mirrorSlideIndex = this.currentSlide - this.innerElements.length + (2 * this.perPage)
        const mirrorSlideIndexOffset = this.perPage
        const moveTo = mirrorSlideIndex + mirrorSlideIndexOffset
        const offset = -1 * moveTo * (this.selectorWidth / this.perPage)
        const dragDistance = draggable ? this.drag.endX - this.drag.startX : 0
        requestAnimationFrame(() => {
          this.sliderFrame.style[transformProperty] = `translate3d(${offset + dragDistance}px, 0, 0)`
        })
        this.currentSlide = mirrorSlideIndex + howManySlides
      } else {
        this.currentSlide += howManySlides
      }
    } else {
      this.currentSlide = Math.min(this.currentSlide + howManySlides, this.innerElements.length - this.perPage)
    }

    if (beforeChange !== this.currentSlide) {
      this.slideToCurrent(loop)
    }
  }

  slideToCurrent = enableTransition => {
    const currentSlide = this.props.loop ? this.currentSlide + this.perPage : this.currentSlide
    const offset = -1 * currentSlide * (this.selectorWidth / this.perPage)

    if (enableTransition) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.enableTransition()
          this.sliderFrame.style[transformProperty] = `translate3d(${offset}px, 0, 0)`
        })
      })
    } else {
      this.sliderFrame.style[transformProperty] = `translate3d(${offset}px, 0, 0)`
    }
  }

  updateAfterDrag = () => {
    const { threshold } = this.props
    const movement = this.drag.endX - this.drag.startX
    const movementDistance = Math.abs(movement)
    const howManySliderToSlide = Math.ceil(movementDistance / (this.selectorWidth / this.perPage))
    
    const slideToNegativeClone = movement > 0 && this.currentSlide - howManySliderToSlide < 0
    const slideToPositiveClone = movement < 0 && this.currentSlide + howManySliderToSlide > this.innerElements.length - this.perPage

    if (movement > 0 && movementDistance > threshold && this.innerElements.length > this.perPage) {
      this.prev(howManySliderToSlide)
    } else if (movement < 0 && movementDistance > threshold && this.innerElements.length > this.perPage) {
      this.next(howManySliderToSlide)
    }
    this.slideToCurrent(slideToNegativeClone || slideToPositiveClone)
  }

  // TODO make it work
  // resize = () => {
  //   this.resolveSlidesNumber(this.innerElements.length)

  //   this.selectorWidth = this.selector.getBoundingClientRect().width
  //   this.setStyle(this.sliderFrame, {
  //     width: (this.selectorWidth / this.perPage) * this.innerElements.length
  //   })

  //   this.innerElements.forEach(el => {
  //     this.setStyle(el, {
  //       width: `${100 / this.innerElements.length}%`
  //     })
  //   })
  // }

  clearDrag = () => {
    this.drag = {
      startX: 0,
      endX: 0,
      startY: 0,
      letItGo: null
    }
  }

  setStyle(target, styles) {
    Object.keys(styles).forEach(attr => {
      target.style[attr] = styles[attr]
    })
  }

  // TODO add touch events

  onMouseDown = e => {
    e.preventDefault()
    e.stopPropagation()
    this.pointerDown = true
    this.drag.startX = e.pageX
  }

  onMouseUp = e => {
    e.stopPropagation()
    this.pointerDown = false
    this.enableTransition({ cursor: '-webkit-grab' })

    if (this.drag.endX) {
      this.updateAfterDrag()
    }

    this.clearDrag()
  }

  onMouseMove = e => {
    const { easing, loop } = this.props

    e.preventDefault()
    if (this.pointerDown) {
      // TODO prevent link clicks

      this.drag.endX = e.pageX

      const currentSlide = loop ? this.currentSlide +  this.perPage : this.currentSlide
      const currentOffset = currentSlide * (this.selectorWidth / this.perPage)
      const dragOffset = (this.drag.endX - this.drag.startX)
      const offset = currentOffset - dragOffset

      this.setStyle(this.sliderFrame, {
        cursor: '-webkit-grabbing',
        webkitTransition: `all 0ms ${easing}`,
        transition: `all 0ms ${easing}`,
        [transformProperty]: `translate3d(${offset * -1}px, 0, 0)`
      })
    }
  }

  onMouseLeave = e => {

    if (this.pointerDown) {
      this.pointerDown = false
      this.drag.endX = e.pageX

      this.enableTransition({ cursor: '-webkit-grab' })
      this.updateAfterDrag()
      this.clearDrag()
    }
  }

  render() {
    const { children: childrenProp, loop } = this.props
    if (!this.perPage) {
      this.resolveSlidesNumber()
    }

    const newChildren = loop ? Children.map([
      ...childrenProp.slice(childrenProp.length - this.perPage, childrenProp.length),
      ...childrenProp,
      ...childrenProp.slice(0, this.perPage)
    ], (c, i) => cloneElement(c, { key: i })) : childrenProp

    return (
      <div
        ref={selector => this.selector = selector}
        style={{ overflow: 'hidden' }}
        {...Slider.events.reduce((props, event) => ({ ...props, [event]: this[event] }), {})}
      >
        <div ref={sliderFrame => this.sliderFrame = sliderFrame}>
          {newChildren}
        </div>
      </div>
    )
  }
}
