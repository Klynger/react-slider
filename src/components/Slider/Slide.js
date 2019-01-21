import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class Slide extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired
  }

  render() {
    const { children } = this.props
    
    return (
      <div className="slide">
        {children}
      </div>
    )
  }
}
