import React, { Component } from 'react'
import Slider from '../Slider/Slider'
import Slide from '../Slider/Slide'
import SliderContainer from '../Slider/SliderContainer'
import Dots from '../Slider/Dots'
import ProductSummary from '../ProductSummary'
import './App.css'

class App extends Component {
  constructor(props) {
    super(props)
    this.sliderRef = React.createRef()

    this.state = {
      currentSlide: 0
    }
  }
  get slides() {
    return [1, 2, 3, 4, 5]
  }

  handleChangeCurrentSlide = i => {
    this.setState({ currentSlide: i })
  }

  componentDidMount() {
    this.forceUpdate()
  }

  render() {
    const { currentSlide } = this.state

    return (
      <div className="app">
        <SliderContainer className="slide-group-container">
          <Slider loop ref={this.sliderRef} perPage={3} onChangeCurrentSlide={this.handleChangeCurrentSlide}>
            {this.slides.map(i => (
              <Slide key={i}>
                <ProductSummary index={i} />
              </Slide>
            ))}
          </Slider>
          <Dots sliderRef={this.sliderRef} currentSlide={currentSlide} />
        </SliderContainer>
      </div>
    );
  }
}

export default App
