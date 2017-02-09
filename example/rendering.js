var fit = require('canvas-fit')
var mouseWheel = require('mouse-wheel')
var mouseChange = require('mouse-change')
// var createScatter = require('gl-scatter2d-fancy')
var createScatter = require('../')
var createSelectBox = require('gl-select-box')
var createSpikes = require('gl-spikes2d')
var createPlot = require('gl-plot2d')
var createFps = require('fps-indicator')

createFps()

var canvas = document.createElement('canvas')
document.body.appendChild(canvas)
window.addEventListener('resize', fit(canvas, null, +window.devicePixelRatio), false)

var gl = canvas.getContext('webgl', {
  depth: false,
  // alpha: true,
  // premultipliedAlpha: true
})

//5e6 is allocation maximum
// var POINT_COUNT = 3e6
var POINT_COUNT = 1e3

var aspect = gl.drawingBufferWidth / gl.drawingBufferHeight
var dataBox = [-10,-10/aspect,10,10/aspect]

function makeTicks(lo, hi) {
  var result = []
  for(var i=lo; i<=hi; ++i) {
    result.push({
      x: i,
      text: i + ''
    })
  }
  return result
}

var options = {
  gl:             gl,
  dataBox:        dataBox,
  title:          '100 million points',
  ticks:          [ makeTicks(-20,20), makeTicks(-20,20) ],
  labels:         ['x', 'y'],
  pixelRatio:     +window.devicePixelRatio,
  tickMarkWidth:  [1,1,1,1],
  tickMarkLength: [3,3,3,3]
}

var plot = createPlot(options)



var selectBox = createSelectBox(plot, {
  innerFill: false,
  outerFill: true
})
selectBox.enabled = false

var spikes = createSpikes(plot)



var positions = new Float32Array(2 * POINT_COUNT)
for(var i=0; i<2*POINT_COUNT; ++i) {
  positions[i] = Math.random()
}

var glyphs = new Array(POINT_COUNT)
var MARKERS = [ '●', '#', '✝', '+' ]
for(var i=0; i<POINT_COUNT; ++i) {
  glyphs[i] = MARKERS[(Math.random() * MARKERS.length)|0]
}

var colors = new Array(4 * POINT_COUNT)
var borderColors = new Array(4 * POINT_COUNT)
for(var i=0; i<4*POINT_COUNT; ++i) {
  colors[i] = Math.random()
  // if (!((i+1)%4)) colors[i] = 1;
  borderColors[i] = +((i % 4) === 3)
}


var sizes = new Float32Array(POINT_COUNT)
var borderWidths = new Float32Array(POINT_COUNT)
for(var i=0; i<POINT_COUNT; ++i) {
  borderWidths[i] = 1
  sizes[i] = 10 + Math.random() * 10
}

var scatter = createScatter(plot, {
  // positions:  positions,
  // sizes:      sizes,
  // colors:     colors,
  // glyphs:     glyphs,
  // borderWidths: borderWidths,
  // borderColors: borderColors,


  positions:  [.5,.5, 1.5,.5, 2.5,.5, 3.5,.5, 4.5,.5, 5.5,.5, 6.5,.5, 7.5,.5, 8.5,.5, 9.5,.5,
               .5,1.5, 1.5,1.5, 2.5,1.5,
               .5,2.5, 1.5,2.5, 2.5,2.5,
               .5,3.5, 1.5,3.5, 2.5,3.5, 3.5,3.5, 4.5,3.5, 5.5,3.5],
  sizes:      [10, 20, 30, 40, 50, 60, 70, 80, 90, 100,
               25, 30, 35,
               40, 45, 50,
               1, 2, 5, 10, 12, 15],
  colors:     [0,0,0,1, .1,0,0,1, .2,0,0,1, .3,0,0,1, .4,0,0,1, .5,0,0,1, .6,0,0,1, .7,0,0,1, .8,0,0,1, .9,0,0,1,
               1,0,0,1, 0,1,0,1, 0,0,1,1,
               0,0,0,.2, 0,0,0,.5, 0,0,0,.8,
               0,0,1,1, 0,0,1,1, 0,0,1,1, 0,0,1,1, 0,0,1,1, 0,0,1,1],
  glyphs:     ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
               '•', '+', '#',
               'E', '=', 'mc²',
               '●', '●', '●', '●', '●', '●'],
  borderWidths: [1,1,1,1,1,1,1,1,1,1,
                 2,2,2,
                 0,0,0,
                 .5, .5, .5, .5, .5, .5],
  borderColors: [0,0,1,1, 0,0,1,.9, 0,0,1,.8, 0,0,1,.7, 0,0,1,.6, 0,0,1,.5, 0,0,1,.4, 0,0,1,.3, 0,0,1,.2, 0,0,1,.1,
                 0,1,0,1, 0,0,1,1, 1,0,0,1,
                 0,0,0,1, 0,0,0,1, 0,0,0,1,
                 0,0,0,1, 0,0,0,1, 0,0,0,1, 0,0,0,1, 0,0,0,1, 0,0,0,1],
})


var lastX = 0, lastY = 0
var boxStart = [0,0]
var boxEnd   = [0,0]
var boxEnabled = false
mouseChange(function(buttons, x, y, mods) {
  y = window.innerHeight - y
  x *= plot.pixelRatio
  y *= plot.pixelRatio

  if(buttons & 1) {
    if(mods.shift) {
      var dataX = (x - plot.viewBox[0]) / (plot.viewBox[2]-plot.viewBox[0]) * (dataBox[2] - dataBox[0]) + dataBox[0]
      var dataY = (y - plot.viewBox[1]) / (plot.viewBox[3]-plot.viewBox[1]) * (dataBox[3] - dataBox[1]) + dataBox[1]
      if(!boxEnabled) {
        boxStart[0] = dataX
        boxStart[1] = dataY
      }
      boxEnd[0] = dataX
      boxEnd[1] = dataY
      boxEnabled = true
      spikes.update()
    } else {
      var dx = (lastX - x) * (dataBox[2] - dataBox[0]) / (plot.viewBox[2]-plot.viewBox[0])
      var dy = (lastY - y) * (dataBox[3] - dataBox[1]) / (plot.viewBox[3] - plot.viewBox[1])

      dataBox[0] += dx
      dataBox[1] += dy
      dataBox[2] += dx
      dataBox[3] += dy

      plot.setDataBox(dataBox)
      spikes.update()
    }
  } else {
    var result = plot.pick(x/plot.pixelRatio, y/plot.pixelRatio)
    if(result) {
      spikes.update({center: result.dataCoord})
    } else {
      spikes.update()
    }
  }

  if(boxEnabled) {
    selectBox.enabled = true
    selectBox.selectBox = [
      Math.min(boxStart[0], boxEnd[0]),
      Math.min(boxStart[1], boxEnd[1]),
      Math.max(boxStart[0], boxEnd[0]),
      Math.max(boxStart[1], boxEnd[1])
    ]
    plot.setDirty()
    if(!((buttons&1) && mods.shift)) {
      selectBox.enabled = false
      dataBox = [
        Math.min(boxStart[0], boxEnd[0]),
        Math.min(boxStart[1], boxEnd[1]),
        Math.max(boxStart[0], boxEnd[0]),
        Math.max(boxStart[1], boxEnd[1])
      ]
      plot.setDataBox(dataBox)
      boxEnabled = false
    }
  }

  lastX = x
  lastY = y
})

mouseWheel(function(dx, dy, dz) {
  var scale = Math.exp(0.1 * dy / gl.drawingBufferHeight)

  var cx = (lastX - plot.viewBox[0]) / (plot.viewBox[2] - plot.viewBox[0]) * (dataBox[2] - dataBox[0]) + dataBox[0]
  var cy = (plot.viewBox[1] - lastY) / (plot.viewBox[3] - plot.viewBox[1]) * (dataBox[3] - dataBox[1]) + dataBox[3]

  dataBox[0] = (dataBox[0] - cx) * scale + cx
  dataBox[1] = (dataBox[1] - cy) * scale + cy
  dataBox[2] = (dataBox[2] - cx) * scale + cx
  dataBox[3] = (dataBox[3] - cy) * scale + cy

  plot.setDataBox(dataBox)

  return true
})

function render() {
  requestAnimationFrame(render)
  plot.draw()
}

render()
