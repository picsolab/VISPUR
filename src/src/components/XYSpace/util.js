import * as d3 from 'd3';
import d3tooltip from 'd3-tooltip';
import {nest} from 'd3-collection';
import { XYSpaceLayout } from '../../layout';
const tooltip = d3tooltip(d3);

export const _getXYMode = (causeVarType, outcomeVarType) => {
    return ((causeVarType === 'continuous') & (outcomeVarType === 'continuous'))
        ? 'Ellipse'
        : 'Circle';
}

// Function to compute density
// function kernelDensityEstimator(kernel, X) {
//     // V is the target array of numeric values
//     // X is xScale.ticks()
//     return function(V) {
//       return X.map(function(x) {
//         return [x, d3.mean(V, function(v) { return kernel(x - v); })];
//       });
//     };
//   }
// function kernelEpanechnikov(k) {
//     return function(v) {
//         return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
//     };
// }
// export function _calcDensity(data, GroupIDList, summaryData, causeVarName, outcomeVarName){
//     let yMin = d3.min(data, d => +d[outcomeVarName]), 
//         yMax = d3.max(data, d => +d[outcomeVarName]),
//         yMean = d3.mean(data, d => +d[outcomeVarName]);
//     var yScale = d3.scaleLinear()
//         .range([XYSpaceLayout.height, 0])
//         .domain([yMin - yMean, yMax + yMean]);
//     var kde = kernelDensityEstimator(kernelEpanechnikov(5), yScale.ticks(20))
//     var densities_at0 = [];
//     var densities_at1 = [];
//     let maxProb = 0;
//     for (var i = 0; i < summaryData.length; i ++){
//         var density =  kde( data
//             .filter( function(d, j){ return parseInt(d[causeVarName]) === 0 && 
//                 GroupIDList[j] === summaryData[i]['groupIndex'] } )
//             .map(function(d){  return +d[outcomeVarName]; }) );
//         densities_at0.push({
//             'groupIndex': summaryData[i]['groupIndex'],
//             'densityArray': density
//         });
//         maxProb = Math.max(maxProb, d3.max(density.map(d => d[1])));
//         density =  kde( data
//             .filter( function(d, j){ return parseInt(d[causeVarName]) === 1 && 
//                 GroupIDList[j] === summaryData[i]['groupIndex'] } )
//             .map(function(d){  return +d[outcomeVarName]; }) );
//         densities_at1.push({
//             'groupIndex': summaryData[i]['groupIndex'],
//             'densityArray': density
//         });
//         maxProb = Math.max(maxProb, d3.max(density.map(d => d[1])));
//     }
//     return {
//         "densities_at0": densities_at0,
//         "densities_at1": densities_at1,
//         'maxProb': maxProb
//     };
// }


export const seqColorScale = d3
    .scaleSequential(
        // d3.interpolateHclLong("purple", "blue")
        // d3.interpolateCubehelixLong("purple", "orange")
        // d3.interpolatePRGn
        // d3.interpolateBlues
        // d3.interpolatePurples
        // d3.interpolateSpectral
        // d3.interpolateViridis
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

// export function _renderXYSpaceDensity(ref, data, summaryData, outcomeVarName, density){
//     const {maxProb, densities_at0, densities_at1} = density;

//     const svg = d3.select(ref.current);
//     svg.selectAll('*').remove();

//     svg.attr("width", 
//             XYSpaceLayout.width + XYSpaceLayout.margin.left + XYSpaceLayout.margin.right)
//         .attr("height", 
//             XYSpaceLayout.height + XYSpaceLayout.margin.top + XYSpaceLayout.margin.bottom)
//         .append("g")
//         .attr("transform", 
//             "translate(" + XYSpaceLayout.margin.left + "," + XYSpaceLayout.margin.top + ")");

//     let yMin = d3.min(data, d => +d[outcomeVarName]), 
//         yMax = d3.max(data, d => +d[outcomeVarName]),
//         yMean = d3.mean(data, d => +d[outcomeVarName]);

//     var yScale = d3.scaleLinear()
//         .range([XYSpaceLayout.height, 0])
//         .domain([yMin - yMean, yMax + yMean]);
//     const leftxScale = d3.scaleLinear()
//         .domain([maxProb, 0])
//         .range([0, XYSpaceLayout.density.leftWidth - XYSpaceLayout.density.padding]);
//     const midxScale = d3.scaleLinear()
//         .domain([0,1])
//         .range([0, XYSpaceLayout.density.midWidth]);
//     const rightxScale = d3.scaleLinear()
//         .domain([0, maxProb])
//         .range([0, XYSpaceLayout.density.rightWidth - XYSpaceLayout.density.padding]);
//     svg.append("g")
//         .attr("class", "yLeft axis")
//         .attr("transform", "translate(" + XYSpaceLayout.density.leftWidth + ", 0)")
//         .call(d3.axisLeft(yScale).tickValues([]));
//     svg.append("g")
//         .attr("class", "yRight axis")
//         .attr("transform", "translate(" + (XYSpaceLayout.density.leftWidth + XYSpaceLayout.density.midWidth) + ", 0)")
//         .call(d3.axisRight(yScale).tickValues([]));
//     svg.append("g")
//         .attr("class", "xLeft axis")
//         .attr("transform", "translate(" + (0) + "," + XYSpaceLayout.height + ")")
//         .call(d3.axisBottom(leftxScale).tickValues([0, 0.12]).tickFormat(d3.format(".1")));
//     svg.append("g")
//         .attr("class", "xMid axis")
//         .attr("transform", "translate(" + (XYSpaceLayout.density.leftWidth) + "," + XYSpaceLayout.height + ")")
//         .call(d3.axisBottom(midxScale).tickValues([0, 1]).tickFormat(d3.format(".0f")));
//     svg.append("g")
//         .attr("class", "xRight axis")
//         .attr("transform", "translate(" + 
//             (XYSpaceLayout.density.leftWidth + XYSpaceLayout.density.midWidth + 
//                 XYSpaceLayout.density.padding) + "," + XYSpaceLayout.height + ")")
//         .call(d3.axisBottom(rightxScale).tickValues([0, 0.12]).tickFormat(d3.format(".1")));
    
//     const gForSubgroup = svg.selectAll(".allgroups")
//         .data(summaryData)
//         .enter()
//         .append("g")
//         .attr('class', (d, i) => 'gForSubgroupID_' + d['groupIndex'] + ' allgroups');

//     gForSubgroup.classed("selected", false);

//     const line = d3.line()
//         .x(function(d) { return midxScale(+d.cause) })
//         .y(function(d) { return yScale(+d.outcomeAvg) });
    
    
//     gForSubgroup
//         .append("path")
//         .attr("class", "line")
//             .style("stroke", function(d) { return colorScale(d.relDiff); })
//             .style("opacity", "0.4")
//             .style("stroke-width", "1px")
//             .attr("transform", "translate(" + XYSpaceLayout.density.leftWidth + ", 0)")
//             .attr("d", function(d){ 
//                 return line(d.values);
//             } );
    
//     for (var i = 0; i < densities_at0.length; i ++) {
//         d3.select(".gForSubgroupID_" + densities_at0[i]['groupIndex'])
//             .append("path")
//             .attr("class", "denCurves")
//             .datum(densities_at0[i]['densityArray'])
//             .style("fill", function(d) { 
//                 let groupIndex = densities_at0[i]['groupIndex'];
//                 return colorScale(summaryData.filter(d => d.groupIndex === groupIndex)[0]['relDiff']);
//             })
//             .style("opacity", ".4")
//             .style("stroke", "#000")
//             .style("stroke-width", 1)
//             .style("stroke-linejoin", "round")
//             .attr("d",  d3.line()
//                 .curve(d3.curveBasis)
//                 .y(function(d) { return yScale(d[0]); })
//                 .x(function(d) { return leftxScale(d[1]); })
//             );

//         d3.select(".gForSubgroupID_" + densities_at1[i]['groupIndex'])
//             .append("path")
//             .attr("class", "denCurves")
//             .attr("transform", 
//                 "translate(" + (XYSpaceLayout.density.leftWidth + 
//                     XYSpaceLayout.density.midWidth + XYSpaceLayout.density.padding) + ",0)")
//             .datum(densities_at1[i]['densityArray'])
//             .style("fill", function(d) { 
//                 let groupIndex = densities_at1[i]['groupIndex'];
//                 return colorScale(summaryData.filter(d => d.groupIndex === groupIndex)[0]['relDiff']);
//             })
//             .style("opacity", ".3")
//             .style("stroke", "#000")
//             .style("stroke-width", 1)
//             .style("stroke-linejoin", "round")
//             .attr("d",  d3.line()
//                 .curve(d3.curveBasis)
//                 .y(function(d) { return yScale(d[0]); })
//                 .x(function(d) { return rightxScale(d[1]); })
//             );
        
//     }
//     gForSubgroup
//         .on("mouseover", function() {
//             d3.select(this)
//                 .selectAll(".denCurves")
//                 .transition()
//                 .duration(400)
//                 .style("opacity", "1.0")
//                 .style("stroke-width", "2px");
//             d3.select(this)
//                 .selectAll(".line")
//                 .transition()
//                 .duration(400)
//                 .style("stroke-width", "2px")
//                 .style("opacity", "1.0");
//         });
//     gForSubgroup
//         .on("mouseout", function() {
//             if (!d3.select(this).classed("selected")) {
//                 d3.select(this)
//                     .selectAll(".denCurves")
//                     .transition().duration(400)
//                     .style("opacity", "0.4")
//                     .style("stroke-width", "1px");
//                 d3.select(this)
//                     .selectAll(".line")
//                     .transition().duration(400)
//                     .style("stroke-width", "1px")
//                     .style("opacity", "0.4");
//             }
//         })

//     gForSubgroup
//         .on("click", function() {
//             var numSel = d3.selectAll(".selected").size();
//             if (!d3.select(this).classed("selected")) {
//                 d3.select(this).classed("selected", true);
//                 if (numSel === 0){
//                     var clickedGroup = this;
//                     d3.selectAll(".allgroups").each(function() {
//                         var currGroup = this;
//                         d3.select(this)
//                         .selectAll(".denCurves")
//                         .transition().duration(400)
//                         .style("opacity", function(){
//                             return (currGroup === clickedGroup) ? "1.0" : "0.1";
//                         })
//                         .style("stroke-width", function() {
//                             return (currGroup === clickedGroup) ? "2px" : "1px";
//                         })
//                     })
//                 } else {
//                     d3.select(this)
//                         .selectAll(".denCurves")
//                         .transition()
//                         .duration(400)
//                         .style("opacity", "1.0")
//                         .style("stroke-width","2px");
//                 }
//             } else {
//                 d3.select(this).classed("selected", false);
//                 d3.select(this)
//                     .selectAll(".denCurves")
//                     .transition().duration(400)
//                     .style("opacity", "0.4")
//                     .style("stroke-width", "1px");
//                 d3.selectAll(".line")
//                     .transition().duration(400)
//                     .style("stroke-width", "1px")
//                     .style("opacity", "0.4");
//             }
//         });
// }

export function toDegrees(rad) {
    return -1.0 * rad * (180/Math.PI);
}

export function unitX(coef) {
  return 0.4 / Math.sqrt( 1.0 + Math.pow(coef, 2))
}