import React, { Children, Component, cloneElement } from 'react'
import debounce from 'debounce'
import PropTypes from 'prop-types'
import transformProperty from '../../utils/transformProperty'


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

    this.state = {
      pointerDown: false,
      currentSlide: props.startIndex
    }

    this.drag = {
      startX: 0,
      endX: 0,
      startY: 0,
      letItGo: null
    }
  }

  componentDidMount() {
    this.init()

    this.onResize = debounce(() => {
      this.resize()
      this.slideToCurrent()
    }, this.props.resizeDebounce)

    window.addEventListener('resize', this.onResize)
  }

  componentDidUpdate() {
    this.init()
  }

  init = () => {
    const { duration, easing } = this.props
    this.setSelectorWidth()
    this.setInnerElements()
    this.resolveSlidesNumber(this.innerElements.length)
    this.setStyle(this.sliderFrame, {
      width: `${(this.selectorWidth / this.perPage) * this.innerElements.length}px`,
      webkitTransition: `all ${duration}ms ${easing}`,
      transition: `all ${duration}ms ${easing}`
    })

    this.innerElements.forEach(el => {
      this.setStyle(el, {
        width: `${100 / this.innerElements.length}%`
      })
    })

    this.slideToCurrent()
    this.props.onInit.call(this)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize)
  }

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
      for (const viewport in this.props.perPage) {
        if (window.innerWidth >= viewport) {
          this.perPage = this.props.perPage[viewport]
        }
      }
    }
  }

  prev = (howManySlides = 1) => {
    let newCurrentSlide
    this.setState(({ currentSlide }) => {
      const newCurrentSlide = Math.max(currentSlide - howManySlides, 0)

      this.slideToCurrent(newCurrentSlide)
      return {
        currentSlide: newCurrentSlide
      }
    })
    this.props.onChange.call(this)

    return newCurrentSlide
  }

  next = (howManySlides = 1) => {
    let newCurrentSlide
    if (this.innerElements.length <= this.perPage) {
      return
    }
    this.setState(({ currentSlide }) => {
      newCurrentSlide = Math.min(currentSlide + howManySlides, this.innerElements.length - this.perPage)

      if (newCurrentSlide !== currentSlide) {
        this.slideToCurrent(newCurrentSlide)
        this.props.onChange.call(this)
      }

      return {
        currentSlide: newCurrentSlide
      }
    })
    return newCurrentSlide
  }

  slideToCurrent = (currentSlide) => {
    const offset = -1 * currentSlide * (this.selectorWidth / this.perPage)
    this.sliderFrame.style[transformProperty] = `translate3d(${offset}px, 0, 0)`
  }

  updateAfterDrag = () => {
    const { threshold } = this.props
    const movement = this.drag.endX - this.drag.startX
    let newCurrentSlide
    if (movement > 0 && Math.abs(movement) > threshold) {
      newCurrentSlide = this.prev()
    } else if (movement < 0 && Math.abs(movement) > threshold) {
      newCurrentSlide = this.next()
    }
    this.slideToCurrent(newCurrentSlide)
  }

  resize = () => {
    this.resolveSlidesNumber(this.innerElements.length)

    this.selectorWidth = this.selector.getBoundingClientRect().width
    this.setStyle(this.sliderFrame, {
      width: (this.selectorWidth / this.perPage) * this.innerElements.length
    })
  }

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

  onMouseDown = e => {
    e.preventDefault()
    e.stopPropagation()
    this.setState({ pointerDown: true })
    this.drag.startX = e.pageX
  }

  onMouseUp = e => {
    const { duration, easing } = this.props

    e.stopPropagation()
    this.setState({ pointerDown: false })
    this.setStyle(this.sliderFrame, {
      cursor: '-webkit-grab',
      webkitTransition: `all ${duration}ms ${easing}`,
      transition: `all ${duration}ms ${easing}`
    })

    if (this.drag.endX) {
      this.updateAfterDrag()
    }

    this.clearDrag()
  }

  onMouseMove = e => {
    const { easing } = this.props
    const { currentSlide } = this.state

    e.preventDefault()
    if (this.state.pointerDown) {
      this.drag.endX = e.pageX

      const dragOffset = (this.drag.endX - this.drag.startX)
      const currentOffset = currentSlide * (this.selectorWidth / this.perPage)
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
    const { duration, easing } = this.props

    if (this.state.pointerDown) {
      this.setState({ pointerDown: false })
      this.drag.endX = e.pageX

      this.setStyle(this.sliderFrame, {
        cursor: '-webkit-grab',
        webkitTransition: `all ${duration}ms ${easing}`,
        transition: `all ${duration}ms ${easing}`
      })
      this.updateAfterDrag()
      this.clearDrag()
    }
  }

  render() {
    const { children } = this.props
    return (
      <div
        ref={selector => this.selector = selector}
        style={{ overflow: 'hidden' }}
        {...Slider.events.reduce((props, event) => ({ ...props, [event]: this[event] }), {})}
      >
        <div ref={sliderFrame => this.sliderFrame = sliderFrame}>
          {Children.map(children, (child, index) =>
            cloneElement(child, {
              key: index,
              style: { float: 'left', backgroundColor: '#777' }
            })
          )}
        </div>
      </div>
    )
  }
}
