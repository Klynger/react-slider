import React, { Component } from 'react'
import classnames from 'classnames'
import PropTypes from 'prop-types'
import Slider from './Slider'

class Dots extends Component {
  get slideIndeces() {
    const {
      perPage,
      sliderRef: { current: slider },
      totalSlides
    } = this.props

    if (slider) {
      return [...Array(perPage ? Math.ceil(totalSlides / slider.perPage) : totalSlides).keys()]
    }
    return []
  }

  calculateDotIndex = () => {
    const {
      perPage: isPerPage,
      currentSlide,
      totalSlides,
      sliderRef: { current: slider }
    } = this.props

    let actualCurrentSlide = currentSlide
    const isCurrentSlideNegativeClone = currentSlide < 0
    if (isCurrentSlideNegativeClone) {
      actualCurrentSlide = currentSlide + totalSlides
    }
    return isPerPage ? Math.floor(actualCurrentSlide / slider.perPage) : actualCurrentSlide
  }

  handleDotClick = index => {
    const {
      perPage,
      sliderRef: { current: slider },
      onChangeCurrentSlide
    } = this.props

    let slideToGo
    if (perPage) {
      slideToGo = index * slider.perPage
    } else {
      slideToGo = index
    }
    onChangeCurrentSlide(slideToGo)
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
      onChangeCurrentSlide,
      totalSlides,
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
  onChangeCurrentSlide: PropTypes.func.isRequired,
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
