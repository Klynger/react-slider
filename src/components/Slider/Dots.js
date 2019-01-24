import { resolveSlidesNumber } from '../../utils'
import React, { Component } from 'react'
import classnames from 'classnames'
import PropTypes from 'prop-types'
import debounce from 'debounce'

class Dots extends Component {
  get slideIndeces() {
    const {
      showDotsPerPage,
      totalSlides
    } = this.props

    if (this.perPage) {
      return [...Array(showDotsPerPage ? Math.ceil(totalSlides / this.perPage) : totalSlides).keys()]
    }
    return []
  }

  calculateDotIndex = () => {
    const {
      showDotsPerPage,
      currentSlide,
      totalSlides,
    } = this.props

    let actualCurrentSlide = currentSlide
    const isCurrentSlideNegativeClone = currentSlide < 0
    if (isCurrentSlideNegativeClone) {
      actualCurrentSlide = currentSlide + totalSlides
    }
    return showDotsPerPage ? Math.floor(actualCurrentSlide / this.perPage) : actualCurrentSlide
  }

  handleDotClick = index => {
    const {
      showDotsPerPage,
      onChangeCurrentSlide
    } = this.props

    let slideToGo
    if (showDotsPerPage) {
      slideToGo = index * this.perPage
    } else {
      slideToGo = index
    }
    onChangeCurrentSlide(slideToGo)
  }

  componentDidMount() {
    this.onResize = debounce(() => {
      const { perPage } = this.props
      this.perPage = resolveSlidesNumber(perPage)
      this.forceUpdate()
    }, 250)
    window.addEventListener('resize', this.onResize)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize)
  }

  render() {
    const {
      rootTag: RootTag,
      dotTag: DotTag,
      className,
      dotProps,
      dotClasses: dotClassesProp,
      showDotsPerPage,
      perPage,
      currentSlide,
      onChangeCurrentSlide,
      totalSlides,
      ...otherProps
    } = this.props

    if (!this.perPage) {
      this.perPage = resolveSlidesNumber(perPage)
    }

    return (
      <RootTag className={classnames('slider-dots-container', className)} {...otherProps}>
        {this.slideIndeces.map(i => {
          const dotClasses = classnames('slider-dot', dotClassesProp, {
            active: i === this.calculateDotIndex()
          })
          return (
            <DotTag className={dotClasses} key={i} onClick={() => this.handleDotClick(i)} {...dotProps} />
          )
        })}
      </RootTag>
    )
  }
}

Dots.propTypes = {
  perPage: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  showDotsPerPage: PropTypes.bool,
  onChangeCurrentSlide: PropTypes.func.isRequired,
  rootTag: PropTypes.string,
  dotTag: PropTypes.string,
  className: PropTypes.string,
  dotProps: PropTypes.object
}

Dots.defaultProps = {
  rootTag: 'ul',
  dotTag: 'li',
  showDotsPerPage: false,
}

export default Dots
