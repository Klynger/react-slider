import React, { forwardRef } from 'react'
import classnames from 'classnames'
import PropTypes from 'prop-types'

const render = (props, ref) => {
  const {
    tag: RootTag,
    className,
    children,
    ...otherProps
  } = props
  return (
    <RootTag className={classnames('slider-container', className)} ref={ref} {...otherProps}>
      {children}
    </RootTag>
  )
}

render.displayName = 'SliderContainer'

const SliderContainer = forwardRef(render)

SliderContainer.propTypes = {
  tag: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node.isRequired
}

SliderContainer.defaultProps = {
  tag: 'div'
}

export default SliderContainer
