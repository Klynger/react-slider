import React, { Component } from 'react'
import Slider from '../Slider/Slider'
import Slide from '../Slider/Slide'
import SliderContainer from '../Slider/SliderContainer'
import Dots from '../Slider/Dots'
import Arrow from '../Slider/Arrow'
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

    const perPage = {
      600: 1,
      1000: 2
    }

    return (
      <div className="app">
        <SliderContainer className="slide-group-container">
          <Slider
            loop
            perPage={perPage}
            ref={this.sliderRef}
            currentSlide={currentSlide}
            onChangeCurrentSlide={this.handleChangeCurrentSlide}
          >
            {this.slides.map(i => (
              <Slide key={i}>
                <ProductSummary index={i} />
              </Slide>
            ))}
          </Slider>
          <Arrow onClick={this.sliderRef.current ? this.sliderRef.current.prevPage : () => {}} />
          <Arrow right onClick={this.sliderRef.current ? this.sliderRef.current.nextPage : () => {}} />
          <Dots
            showDotsPerPage
            perPage={perPage}
            currentSlide={currentSlide}
            totalSlides={this.slides.length}
            onChangeCurrentSlide={this.handleChangeCurrentSlide}
          />
        </SliderContainer>
      </div>
    );
  }
}

export default App
