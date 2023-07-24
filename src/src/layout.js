import * as d3 from 'd3';

// layout specs
export const l = {
  xy: {
    svg: {
      w: 800,
      h: 500
    }
  },
  st: {
    svg: {
      w: 800,
      h: 200,
      m: 15
    }
  }
}
export const LollipopLayout = {
  "margin": {
    "top": 40, 
    "right": 50, 
    "bottom": 20, 
    "left": 120
  },
  "width": 170,
  "height": 300
}

export const StorytellingLayout = {
  'width': 200,
  'height': 180,
  'xpadding': 30,
  'groupNode': {'width': 8, 'height': 50}, // groupNode.height === causeNode.maxHeight (!!! must)
  'causeNode': {'width': 8, 'maxHeight': 50},
  'outcomeNode': {'width': 1.5, 'height': 120}
}

//  H 550 x W 585
export const XYSpaceLayout = {
  "margin" : {
      "right": 150,
      "bottom": 50,
      "left": 110,
      "top": 35
  },
  // "width": 350,
  "width": 300, // temporary
  "height": 350,
  "circlePadding": 40,
  "circle": {
      "minRadius": 10,
      "maxRadius": 35
  },
  "density": {
      "padding": 10,
      "leftWidth": 80,
      "rightWidth": 80,
      "midWidth": 140
  }
}

export const csLayout = {
  "margin": {
    "right": 40, 
    "bottom": 20, 
    "left": 40,
    "top": 15
  },
  "width": 70,
  "height": 70
}

export const cfg = {
    levels: 3,
    labelFactor: 1.25,
    wrapWidth: 60,
    opacityArea: 0.5,
    dotRadius: 4,
    opacityCircles: 0.1,
    strokeWidth: 2,
    roundStrokes: true
}

export const sliderLayout = {
  histXwidth: 140,
  histYheight: 25,
}