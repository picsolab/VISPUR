import * as d3 from 'd3';

export function getMaxMinValue(features){
    let maxminValue = {};
    features.forEach(function(e){
      const {name, type} = e;
      if (type === 'continuous'){
        maxminValue[name] = {
          'type': 'continuous',
          'max': e['range'][1],
          'min': e['range'][0]
        }
      } else {
        const {label} = e;
        label.forEach(function(l){
          maxminValue[name + '_' + l] = {
            'type': 'categorical',
            'max': 1.0,
            'min': 0.0
          }
        })
      }
    });
    return maxminValue;
}


export const seqColorScale = d3
    .scaleSequential(
        // d3.interpolateHclLong("purple", "blue")
        // d3.interpolateCubehelixLong("purple", "orange")
        // d3.interpolatePRGn
        // d3.interpolateBlues
        // d3.interpolatePurples
        // d3.interpolateSpectral
        d3.interpolateSinebow
        // d3.interpolateRdYlBu
    ).domain([99, 0]);

export function setColor(colorScale, i, n){
    return colorScale(Math.floor(i * 100 / n));
}

export function wrap(text, width) {
    text.each(function() {
    var text = d3.select(this),
      words = text.text().split(/\s+/).reverse(),
      word,
      line = [],
      lineNumber = 0,
      lineHeight = 1.4,
      y = text.attr("y"),
      x = text.attr("x"),
      dy = parseFloat(text.attr("dy")),
      tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
      
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
      line.pop();
      tspan.text(line.join(" "));
      line = [word];
      tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
}