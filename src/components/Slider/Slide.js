import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class Slide extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired
  }

  render() {
    const { children, style } = this.props
    
    return (
      <div className="slide" style={style}>
        {children}
      </div>
    )
  }
}
