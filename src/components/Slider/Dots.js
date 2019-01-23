import React, { Component } from 'react'
import classnames from 'classnames'
import PropTypes from 'prop-types'
import Slider from './Slider'

class Dots extends Component {
  get slideIndeces() {
    const {
      perPage,
      sliderRef: { current: slider }
    } = this.props

    if (slider) {
      return [...Array(perPage ? Math.ceil(slider.totalSlides / slider.perPage) : slider.totalSlides).keys()]
    }
    return []
  }

  calculateDotIndex = () => {
    const {
      perPage: isPerPage,
      currentSlide,
      sliderRef: { current: slider }
    } = this.props

    let actualCurrentSlide = currentSlide
    const isCurrentSlideNegativeClone = currentSlide < 0
    if (isCurrentSlideNegativeClone) {
      actualCurrentSlide = currentSlide + slider.innerElements.length - (2 * slider.perPage)
    }
    return isPerPage ? Math.floor(actualCurrentSlide / slider.perPage) : actualCurrentSlide
  }

  handleDotClick = index => {
    const {
      perPage,
      sliderRef: { current: slider }
    } = this.props

    let slideToGo
    if (perPage) {
      slideToGo = index * slider.perPage
    } else {
      slideToGo = index
    }

    slider.goTo(slideToGo)
  }

  render() {
    const {
      rootTag: RootTag,
      dotTag: DotTag,
      className,
      dotProps,
      dotClasses: dotClassesProp,
      sliderRef: { current: slider },
      perPage,
      currentSlide,
      ...otherProps
    } = this.props

    if (!slider) {
      return null
    }
    
    return (
      <RootTag className={classnames('slider-dots-container', className)} {...otherProps}>
        {this.slideIndeces.map(i => {
          const dotClasses = classnames('slider-dot', dotClassesProp, {
            active: i === this.calculateDotIndex(perPage, currentSlide, slider.perPage)
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
  perPage: PropTypes.bool,
  rootTag: PropTypes.string,
  dotTag: PropTypes.string,
  className: PropTypes.string,
  sliderRef: PropTypes.shape({
    current: PropTypes.instanceOf(Slider)
  }).isRequired,
  dotProps: PropTypes.object
}

Dots.defaultProps = {
  rootTag: 'ul',
  dotTag: 'li',
  perPage: false
}

export default Dots
