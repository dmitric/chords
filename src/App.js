import React, { Component } from 'react';
import './App.css';
import Hammer from 'hammerjs'

import { HuePicker, SketchPicker } from 'react-color'
import reactCSS from 'reactcss'
import tinycolor from 'tinycolor2'

class App extends Component {
  constructor (props) {
    super(props)

    let brightness = 10
    let saturation = this.between(90, 100)
    let hue = this.between(0, 360)

    this.state = {
      backgroundColor: '#F0F0EB',
      displayColorPickers: true,
      saturation: saturation,
      brightness: brightness,
      hue: hue,
      lines: 8,
      padding: 120,
      radiusScale: 0.9,
      width: 500,
      height: 500,
      paper: 0
    }
  }

  generateLineColor () {
    return tinycolor({h: this.state.hue, s: this.state.saturation, v: this.state.brightness})
  }

  generatePaper (opacity) {
    const rects = []
    
    if (opacity === 0) {
      return rects
    }

    const actualHeight = this.actualHeight()
    const actualWidth = this.actualWidth()

    for (let w=0; w < actualWidth -1 ; w += 2) {
      for (let h=0; h < actualHeight -1; h += 2) {
        let g = this.between(75, 95)
        rects.push(<rect key={`${w}-${h}`} x={w} y={h} height={2} width={2}
          fill={tinycolor({r: 255 * g/100, g: 255 * g/100, b: 255 * g/100 }).toHexString() }
          fillOpacity={opacity} />)
      }
    }

    for (let i = 0; i < 30; i++) {
      let g2 = this.between(40, 60)
      rects.push(<rect key={`${i}-dot`} width={this.between(1,2)} height={this.between(1,2)}
        x={this.between(0, actualWidth-2)}
        y={this.between(0, actualHeight-2)}
        fill={ tinycolor({r: 255 * g2/100, g: 255 * g2/100, b: 255 * g2/100 }).toHexString()}
        fillOpacity={this.between(opacity*250, opacity*300)/100} />)
    }

    return rects
  }

  between (min, max) {
    return Math.random()*(max-min+1.) + min;
  }

  bound (value, min, max) {
    return Math.min(max, Math.max(min, value))
  }

  actualHeight () {
    return this.state.height-2*this.state.padding
  }

  actualWidth () {
    return this.state.width-2*this.state.padding
  }

  removeLine() {
    this.setState({lines: Math.max(3, this.state.lines - 1)})
  }

  addLine() {
    this.setState({lines: Math.min(30, this.state.lines + 1)})
  }

  increaseHue(amt) {
    amt = amt || 1
    this.setState({hue: (this.state.hue + amt) > 360 ? 0 : this.state.hue + amt})
  }

  decreaseHue(amt) {
    amt = amt || 1
    this.setState({hue:  (this.state.hue - amt) < 0 ? 360 : this.state.hue - amt})
  }

  generateStripes () {
    const stripes = []

    const actualWidth = this.actualWidth()

    const diam = actualWidth/(2*this.state.radiusScale)
    
    const stripeWidth = diam/5

    let start = diam + diam/2 - diam/10

    const step = diam / this.state.lines

    const col = this.generateLineColor().toHsv()

    for (let stripe=0; stripe < this.state.lines; stripe++) {
      const h = col.h
      const s = col.s - (stripe)/this.state.lines
      const v = col.v + (stripe * (100 - this.state.lines)/(100*this.state.lines))
      
      const newCol = tinycolor.fromRatio({
        h: h,
        s: s,
        v: v
      })

      stripes.push(
        <g key={`stripe-${stripe}`}
          transform={`translate(${actualWidth/2},${start - stripeWidth/2 })rotate(${this.between(7, 22) * (Math.random() > 0.5 ? 1 : -1)})`}>
            <title>{newCol.toHsvString()}</title>
            <rect fill={newCol.toHexString()} x={"-50%"} y={0} width={"100%"} height={stripeWidth}/>
        </g>)
      start -= step - this.between(0, step/2) * (Math.random() > 0.5 ? 1: -1)
    }

    return stripes
  }

  render() {
    const actualHeight = this.actualHeight()
    const actualWidth = this.actualWidth()

    return (
      <div className="App">
        { this.state.displayColorPickers ? <div className="color-pickers">
          <ColorPicker color={tinycolor(this.state.backgroundColor).toRgb()} disableAlpha={true}
            handleChange={ (color) => this.setState({backgroundColor: color.hex}) } />
          <ColorPicker color={tinycolor({h: this.state.hue, s: 100, v: 100}).toRgb()} useHue={true} disableAlpha={true}
            handleChange={ (color) => {
              this.setState({hue: color.hsv.h})
            }} />
            </div> : null
        }
        <div style={{ padding: this.state.padding }}> 
          <svg width={actualWidth} height={actualHeight} style={{ overflow: 'none' }}>
            <rect width={"100%"} height={"100%"}  fill={this.state.backgroundColor} />
            <g>
              {this.generateStripes()}
            </g>
            <circle
              cx={actualWidth/2} cy={actualHeight/2}
              r={actualWidth/(2*this.state.radiusScale)}
              fill="none" strokeWidth={actualWidth/2}
              stroke={this.state.backgroundColor} />
            <g>
              {this.generatePaper(this.state.paper)}
            </g>
          </svg>
        </div> 
      </div>
    );
  }

  componentWillMount () {
    this.updateDimensions()
  }

  updateDimensions () {
    const w = window,
        d = document,
        documentElement = d.documentElement,
        body = d.getElementsByTagName('body')[0]
    
    const width = w.innerWidth || documentElement.clientWidth || body.clientWidth,
        height = w.innerHeight|| documentElement.clientHeight|| body.clientHeight

    const dim = Math.min(width, height)
    const settings = { width: dim , height: dim }

    if (settings.width >= 500) {
      settings.padding = 120
    } else {
      settings.padding = 0
    }

    this.setState(settings)
  }

  componentWillUnmount () {
    window.removeEventListener("resize", this.updateDimensions.bind(this), true)
    window.removeEventListener('keydown', this.handleKeydown.bind(this), true)
  }

  componentDidMount () {
    window.addEventListener("resize", this.updateDimensions.bind(this), true)
    window.addEventListener('keydown', this.handleKeydown.bind(this), true)

    const mc = new Hammer(document, { preventDefault: true })

    mc.get('swipe').set({ direction: Hammer.DIRECTION_ALL })
    mc.get('pinch').set({ enable: true })

    mc.on("swipedown", ev => this.addLine())
      .on("swipeup", ev => this.removeLine())
      .on("swipeleft", ev => this.increaseHue(10))
      .on("swiperight", ev => this.decreaseHue(10))
      .on("pinchin", ev => { this.addLine() } )
      .on("pinchout", ev => { this.removeLine() })
  }

  handleKeydown (ev) {
    if (ev.which === 67 && !(ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
      this.setState({displayColorPickers: !this.state.displayColorPickers})
    } else if (ev.which === 83 && (ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
      this.handleSave()
    } else if (ev.which === 82 && !(ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
      this.forceUpdate()
    } else if (ev.which === 80 && !(ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
      this.togglePaper()
    } else if (ev.which === 40) {
      ev.preventDefault()
      this.removeLine()
    } else if (ev.which === 38) {
      ev.preventDefault()
      this.addLine()
    } else if (ev.which === 37) {
      ev.preventDefault()
      this.decreaseHue(2)
    } else if (ev.which === 39) {
      ev.preventDefault()
      this.increaseHue(2)
    }
  }

  togglePaper() {
    this.setState({paper: this.state.paper ? 0 : 0.1})
  }

  handleSave () {
    const svgData = document.getElementsByTagName('svg')[0].outerHTML   
    const link = document.createElement('a')
    
    var svgBlob = new Blob([svgData], { type:"image/svg+xml;charset=utf-8" })
    var svgURL = URL.createObjectURL(svgBlob)
    link.href = svgURL 

    link.setAttribute('download', `chords.svg`)
    link.click()
  }

}

class ColorPicker extends React.Component {

  constructor (props) {
    super(props)

    this.state = {
      color: props.color,
      displayColorPicker: props.displayColorPicker,
      disableAlpha: props.disableAlpha,
      useHue: props.useHue
    }
  }

  handleClick = () => {
    this.setState({ displayColorPicker: !this.state.displayColorPicker })
  };

  handleClose = () => {
    this.setState({ displayColorPicker: false })
    if (this.props.handleClose) {
      this.props.handleClose()
    }
  };

  handleChange = (color) => {
    this.setState({ color: color.rgb })
    this.props.handleChange(color)
  };

  render () {

    const styles = reactCSS({
      'default': {
        color: {
          background: this.state.disableAlpha ?
                `rgb(${ this.state.color.r }, ${ this.state.color.g }, ${ this.state.color.b })` :
                `rgba(${ this.state.color.r }, ${ this.state.color.g }, ${ this.state.color.b },  ${ this.state.color.a })`,
        },
        popover: {
          position: 'absolute',
          zIndex: '10',
        },
        cover: {
          position: 'fixed',
          top: '0px',
          right: '0px',
          bottom: '0px',
          left: '0px',
        },
      },
    })

    return (
      <div className='color-picker'>
        <div className='swatch' onClick={ this.handleClick }>
          <div className='color' style={ styles.color } />
        </div>
        { this.state.displayColorPicker ? <div style={ styles.popover }>
          <div style={ styles.cover } onClick={ this.handleClose }/>
          {
            this.state.useHue ?
            <HuePicker color={ this.state.color } onChange={ this.handleChange } disableAlpha={this.state.disableAlpha} /> :
            <SketchPicker color={ this.state.color } onChange={ this.handleChange } disableAlpha={this.state.disableAlpha} />
          }
        </div> : null }
      </div>
    )
  }
}

export default App;
