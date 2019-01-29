import React, { Component, Fragment } from 'react'
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
    this.imgSliderRef = React.createRef()

    this.state = {
      currentSlide: 0,
      currentSlideImg: 0
    }

    this.slidesNumber = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    this.slidesImg = [
      {
        src: 'images/img1.jpg',
        alt: 'Image 1'
      },
      {
        src: 'images/img2.jpg',
        alt: 'Image 2'
      },
      {
        src: 'images/img3.jpg',
        alt: 'Image 3'
      },
      {
        src: 'images/img4.jpeg',
        alt: 'Image 4'
      },
      {
        src: 'images/img5.jpg',
        alt: 'Image 5'
      }
    ]
  }

  handleChangeCurrentSlide = i => {
    this.setState({ currentSlide: i })
  }

  handeChangeCurrentSlideImg = i => {
    this.setState({ currentSlideImg: i })
  }

  componentDidMount() {
    this.forceUpdate()
  }

  render() {
    const { currentSlide, currentSlideImg } = this.state

    const perPage = {
      800: 1,
      900: 2,
      1000: 3,
      1100: 4
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
            {this.slidesNumber.map(i => {
              return (
                <Slide key={i} className="slide-summary">
                  <ProductSummary index={i} />
                </Slide>
              )
            })}
          </Slider>
          {this.sliderRef.current && (
            <Fragment>
              <Arrow onClick={this.sliderRef.current.prevPage} />
              <Arrow right onClick={this.sliderRef.current.nextPage} />
            </Fragment>
          )}
          <Dots
            showDotsPerPage
            perPage={perPage}
            currentSlide={currentSlide}
            totalSlides={this.slidesNumber.length}
            onChangeCurrentSlide={this.handleChangeCurrentSlide}
          />
        </SliderContainer>
        <SliderContainer className="slide-group-container slider-container-img">
          <Slider
            ref={this.imgSliderRef}
            currentSlide={currentSlideImg}
            onChangeCurrentSlide={this.handeChangeCurrentSlideImg}
          >
            {this.slidesImg.map(({ src, alt }) => (
              <Slide key={alt}>
                <img src={src} alt={alt} />
              </Slide>
            ))}
          </Slider>
        </SliderContainer>
      </div>
    );
  }
}

export default App
