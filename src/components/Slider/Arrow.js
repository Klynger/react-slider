import React from 'react'
import classnames from 'classnames'
import PropTypes from 'prop-types'

const Arrow = props => {
  const {
    tag: TagRoot,
    onClick,
    size,
    right,
    positionValue,
    thickness,
    className,
    color,
    ...restProps
  } = props


  const style = {
    color,
    height: size,
    width: size,
    transform: `rotate(${right ? 45 : -135}deg) translate(0, -50%)`,
    [right ? 'right' : 'left']: positionValue,
    borderTop: `solid ${thickness}px currentColor`,
    borderRight: `solid ${thickness}px currentColor`
  }

  return (
    <TagRoot
      className={classnames('arrow icon', className)}
      style={style}
      onClick={() => onClick()}
      {...restProps}
    />
  )
}

Arrow.propTypes = {
  classname: PropTypes.string,
  color: PropTypes.string,
  right: PropTypes.bool,
  positionValue: PropTypes.number,
  onClick: PropTypes.func,
  tag: PropTypes.string,
  size: PropTypes.number
}

Arrow.defaultProps = {
  color: '#000',
  tag: 'button',
  size: 20,
  positionValue: 20,
  thickness: 4,
  right: false
}

export default Arrow
