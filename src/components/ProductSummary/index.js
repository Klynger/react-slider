import React, { Component } from 'react'

export default class  ProductSummary extends Component {
  render() {
    const { index } = this.props
    return (
      <div className="product-summary">
        Product Summary works
        <span>{index}</span>
      </div>
    )
  }
}
