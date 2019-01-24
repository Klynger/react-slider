import React, { Children, Component, cloneElement } from 'react'
// import debounce from 'debounce'
import PropTypes from 'prop-types'
import transformProperty from '../../utils/transformProperty'
import { resolveSlidesNumber } from '../../utils'

class Slider extends Component {
  static propTypes = {
    resizeDebounce: PropTypes.number,
    onChangeCurrentSlide: PropTypes.func.isRequired,
    duration: PropTypes.number,
    easing: PropTypes.string,
    perPage: PropTypes.number,
    draggable: PropTypes.bool,
    threshold: PropTypes.number,
    howManySlides: PropTypes.number,
    loop: PropTypes.bool,
    children: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.arrayOf(PropTypes.element)
    ])
  }

  static defaultProps = {
    resizeDebounce: 250,
    duration: 250,
    easing: 'ease-out',
    perPage: 1,
    currentSlide: 0,
    howManySlides: 1,
    draggable: true,
    threshold: 20,
    loop: false
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
    const { draggable, currentSlide } = this.props
    this.setSelectorWidth()
    this.setInnerElements()
    this.perPage = resolveSlidesNumber(this.props.perPage)
    this.enableTransition({
      width: `${(this.selectorWidth / this.perPage) * this.innerElements.length}px`,
      ...(draggable ? { cursor: '-webkit-grab' } : {}),
    })

    this.innerElements.forEach(el => {
      this.setStyle(el, {
        width: `${100 / this.innerElements.length}%`
      })
    })
    this.slideToCurrent(false, currentSlide)
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

  get totalSlides() {
    return this.innerElements && this.perPage ?  this.innerElements.length - 2 * this.perPage : 0
  }

  prev = (howManySlides = this.props.howManySlides) => {
    if (this.totalSlides <= this.perPage) {
      return
    }

    const {
      loop,
      draggable,
      onChangeCurrentSlide,
      currentSlide
    } = this.props

    let newCurrentSlide = currentSlide
    if (loop) {
      const isNewIndexClone = currentSlide - howManySlides < 0
      if (isNewIndexClone) {
        this.disableTransition()

        const mirrorSlideIndex = currentSlide + this.innerElements.length - (2 * this.perPage)
        const mirrorSlideIndexOffset = this.perPage
        const moveTo = mirrorSlideIndex + mirrorSlideIndexOffset
        const offset = -1 * moveTo * (this.selectorWidth / this.perPage)
        const dragDistance = draggable ? this.drag.endX - this.drag.startX : 0

        requestAnimationFrame(() => {
          this.sliderFrame.style[transformProperty] = `translate3d(${offset + dragDistance}px, 0, 0)`
        })
        newCurrentSlide = mirrorSlideIndex - howManySlides
      } else {
        newCurrentSlide -= howManySlides
      }
    } else {
      newCurrentSlide = Math.max(currentSlide - howManySlides, 0)
    }
    
    if (newCurrentSlide !== currentSlide) {
      this.slideToCurrent(loop, newCurrentSlide)
      requestAnimationFrame(() => {
        onChangeCurrentSlide(newCurrentSlide)
      })
    }
  }

  next = (howManySlides = this.props.howManySlides) => {
    if (this.totalSlides <= this.perPage) {
      return
    }

    const {
      loop,
      draggable,
      onChangeCurrentSlide,
      currentSlide
    } = this.props

    let newCurrentSlide = currentSlide

    if (loop) {
      const isNewIndexClone = currentSlide + howManySlides > this.innerElements.length - (3 * this.perPage)
      if (isNewIndexClone) {
        this.disableTransition()

        const mirrorSlideIndex = currentSlide - this.innerElements.length + (2 * this.perPage)
        const mirrorSlideIndexOffset = this.perPage
        const moveTo = mirrorSlideIndex + mirrorSlideIndexOffset
        const offset = -1 * moveTo * (this.selectorWidth / this.perPage)
        const dragDistance = draggable ? this.drag.endX - this.drag.startX : 0

        requestAnimationFrame(() => {
          this.sliderFrame.style[transformProperty] = `translate3d(${offset + dragDistance}px, 0, 0)`
        })
        newCurrentSlide = mirrorSlideIndex + howManySlides
      } else {
        newCurrentSlide += howManySlides
      }
    } else {
      newCurrentSlide = Math.min(currentSlide + howManySlides, this.innerElements.length - this.perPage)
    }

    if (newCurrentSlide !== currentSlide) {
      this.slideToCurrent(loop, newCurrentSlide)
      requestAnimationFrame(() => {
        onChangeCurrentSlide(newCurrentSlide)
      })
    }
  }

  goTo = index => {
    const { onChangeCurrentSlide, currentSlide, loop } = this.props

    if (this.totalSlides <= this.perPage) {
      return
    }

    let newCurrentSlide = loop ? index % this.totalSlides : Math.min(Math.max(index, 0), this.totalSlides - this.perPage)

    if (newCurrentSlide !== currentSlide) {
      this.slideToCurrent(false, newCurrentSlide)
      onChangeCurrentSlide(newCurrentSlide)
    }
  }

  slideToCurrent = (shouldEnableTransition, current) => {
    const currentSlide = this.props.loop ? current + this.perPage : current
    const offset = -1 * currentSlide * (this.selectorWidth / this.perPage)

    if (shouldEnableTransition) {
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
    const { threshold, currentSlide } = this.props
    const movement = this.drag.endX - this.drag.startX
    const movementDistance = Math.abs(movement)
    const howManySliderToSlide = Math.ceil(movementDistance / (this.selectorWidth / this.perPage))
    
    const slideToNegativeClone = movement > 0 && currentSlide - howManySliderToSlide < 0
    const slideToPositiveClone = movement < 0 && currentSlide + howManySliderToSlide > this.innerElements.length - this.perPage

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
    const { easing, loop, currentSlide } = this.props

    e.preventDefault()
    if (this.pointerDown) {
      // TODO prevent link clicks

      this.drag.endX = e.pageX

      const computedCurrentSlide = loop ? currentSlide +  this.perPage : currentSlide
      const currentOffset = computedCurrentSlide * (this.selectorWidth / this.perPage)
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
      this.perPage = resolveSlidesNumber(this.props.perPage)
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

export default Slider
