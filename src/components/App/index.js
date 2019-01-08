import React, { Component } from 'react'
import Slider from '../Slider/Slider'
import Slide from '../Slider/Slide'
import ProductSummary from '../ProductSummary'
// import ReactSiema from '../Slider/ReactSiema'
import './App.css'

class App extends Component {
  render() {
    return (
      <div className="app">
        <div className="slide-group-container">
          <Slider>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Slide key={i}>
                <ProductSummary index={i} />
              </Slide>
            ))}
          </Slider>
        </div>
        {/* <div className="siema-container">
          <ReactSiema>
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i}>
                <div className="product-summary">
                  Product Summary works
                <span>{i}</span>
                </div>
              </div>
            ))}
          </ReactSiema>
        </div> */}
      </div>
    );
  }
}

export default App
