import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';

import { csLayout, cfg } from '../../layout';
import { wrap, seqColorScale, setColor } from './util'
import '../../App.css';
import d3tooltip from 'd3-tooltip';
const tooltip = d3tooltip(d3);

const SpiderChartVis = ({
    data,
    maxminValue,
    selectedSubgroups,
    setSelectedSubgroups,
    groupIndex,
    ngroups,
    gNames
}) => { 
    // console.log('=== data:', data)

    const ref = useRef(null);
    useEffect(() => {
        if (data.length > 0){
            const svg = d3.select(ref.current);
            svg.selectAll('*').remove();
            svg.attr("width",  csLayout.width + csLayout.margin.left + csLayout.margin.right)
			   .attr("height", csLayout.height + csLayout.margin.top + csLayout.margin.bottom);

            let scaledData = JSON.parse(JSON.stringify(
                data.filter(d => d['groupIndex'] === groupIndex)
            ));

            scaledData.forEach(function(d) {
                // !!!! copy, otherwise data are changed !!!! //
                d['scaled_value'] = 
                    (d['value'] - maxminValue[d['axis']]['min']) / 
                    (maxminValue[d['axis']]['max'] - maxminValue[d['axis']]['min']); 
                d['type'] = maxminValue[d['axis']]['type'];
            });

            // console.log("scaledData:", scaledData);
            
            const nestedScaledData = d3.nest()
                .key(d => d['groupIndex']).entries(scaledData)
                .map(d => d['values']);
            
            // console.log('====nestedScaledData:', nestedScaledData);
            
            
            const allAxis = (nestedScaledData[0].map(function(i, j){return i.axis})),	// Names of each axis
                    total = allAxis.length,
                    radius = Math.min(csLayout.width/2, csLayout.height/2),
                    Format = d3.format('.2f'),
                    angleSlice = Math.PI * 2 / total;
            
            var rScale = d3.scaleLinear()
                            .range([0, radius])
                            .domain([0, 1.0]);
        
            var g = svg.append("g")
                .attr("transform", "translate(" + 
                        (csLayout.width/2 + csLayout.margin.left) + "," + 
                        (csLayout.height/2 + csLayout.margin.top) + ")");
            var filter = g.append('defs').append('filter').attr('id','glow'),
                feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation','2.5').attr('result','coloredBlur'),
                feMerge = filter.append('feMerge'),
                feMergeNode_1 = feMerge.append('feMergeNode').attr('in','coloredBlur'),
                feMergeNode_2 = feMerge.append('feMergeNode').attr('in','SourceGraphic');
            
            var axisGrid = g.append("g").attr("class", "axisWrapper");
            
            //Draw the background circles
            axisGrid.selectAll(".levels")
                .data(d3.range(1,(cfg.levels+1)).reverse())
                .enter()
                    .append("circle")
                    .attr("class", "gridCircle")
                    .attr("r", function(d, i){return radius/cfg.levels*d;})
                    .style("fill-opacity", cfg.opacityCircles)
                    .style("filter" , "url(#glow)");
            
            //Create the straight lines radiating outward from the center
            var axis = axisGrid.selectAll(".spiderAxis")
                .data(allAxis)
                .enter()
                .append("g")
                .attr("class", "spiderAxis");
            //Append the lines
            axis.append("line")
                .attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", function(d, i){ return rScale(1.1) * Math.cos(angleSlice*i - Math.PI/2); })
                .attr("y2", function(d, i){ return rScale(1.1) * Math.sin(angleSlice*i - Math.PI/2); })
                .attr("class", "line");

            axis.append("text")
                    .attr("class", "legend")
                    .attr("text-anchor", "middle")
                    .attr("dy", "0.2em")
                    .attr("x", function(d, i){ return rScale(cfg.labelFactor) * Math.cos(angleSlice*i - Math.PI/2); })
                    .attr("y", function(d, i){ return rScale(cfg.labelFactor) * Math.sin(angleSlice*i - Math.PI/2); })
                    .text(function(d){return d})
                    .call(wrap, cfg.wrapWidth);
            
            //The radial line function
            var radarLine = 
                d3.radialLine()
                    .radius(function(d) { return rScale(d.scaled_value); })
                    .angle(function(d,i) {	return i*angleSlice; })
                    .curve(d3.curveCardinalClosed)
		
				
            //Create a wrapper for the blobs	
            var blobWrapper = g.selectAll(".radarWrapper")
                .data(nestedScaledData)
                .enter().append("g")
                .attr("class", "radarWrapper");
            blobWrapper.classed("selected", selectedSubgroups.has(groupIndex) ? true : false);
		
            
            //Append the backgrounds	
            blobWrapper
                .append("path")
                .attr("class", "radarArea")
                .attr("d", function(d,i) { return radarLine(d); })
                .style("fill", setColor(seqColorScale, parseInt(groupIndex), ngroups))
                .style("fill-opacity", function(d){
                    return selectedSubgroups.has(groupIndex) ? 1.0 : cfg.opacityArea;
                });

            blobWrapper
                .on('click', function(d){
                    if (!d3.select(this).classed("selected")){
                        d3.select(this).classed("selected", true);
                        setSelectedSubgroups((prevState) => 
                            new Set(prevState.add(groupIndex))
                        );
                    } else {
                        d3.select(this).classed("selected", false);
                        setSelectedSubgroups((prevState) => {
                            prevState.delete(groupIndex);
                            return new Set(prevState);
                        });
                    }
                });
            blobWrapper
                .on('mouseover', function(d){
                    tooltip.html(
                        groupIndex === 'P' 
                            ? '<div>GroupID Population' + '</div>'
                            : '<div>GroupID ' + groupIndex + '</div>' +
                            '<div>' +
                                gNames[groupIndex].split("; ").map(
                                function(e){
                                    return e + '<br />';
                                }
                                ).join(' ') + '</div>'
                    );
                    tooltip.show();
                    d3.select(this)
                      .selectAll(".radarArea")
                      .transition()
                      .duration(250)
                      .style("fill-opacity", 0.9);
                })
                .on('mouseout', function(d) {
                    tooltip.hide();
                    if (!d3.select(this).classed("selected")){
                        d3.select(this)
                          .selectAll(".radarArea")
                          .transition()
                          .duration(250)
                          .style("fill-opacity", cfg.opacityArea);
                    }
                });
            
            //Create the outlines	
            blobWrapper.append("path")
                .attr("class", "radarStroke")
                .attr("d", function(d,i) { return radarLine(d); })
                .style("stroke", setColor(seqColorScale, parseInt(groupIndex), ngroups))
                .style("filter" , "url(#glow)");		
	
            //Append the circles
            blobWrapper.selectAll(".radarCircle")
                .data(function(d, i) { return d; })
                .enter().append("circle")
                .attr("class", "radarCircle")
                .attr("r", cfg.dotRadius)
                .attr("cx", function(d,i){ return rScale(d.scaled_value) * Math.cos(angleSlice*i - Math.PI/2); })
                .attr("cy", function(d,i){ return rScale(d.scaled_value) * Math.sin(angleSlice*i - Math.PI/2); });
            
            //Wrapper for the invisible circles on top
            var blobCircleWrapper = g.selectAll(".radarCircleWrapper")
                .data(nestedScaledData)
                .enter().append("g")
                .attr("class", "radarCircleWrapper");
		
            //Append a set of invisible circles on top for the mouseover pop-up
            blobCircleWrapper.selectAll(".radarInvisibleCircle")
                .data(function(d,i) { return d; })
                .enter().append("circle")
                .attr("class", "radarInvisibleCircle")
                .attr("r", cfg.dotRadius*1.5)
                .attr("cx", function(d,i){ return rScale(d.scaled_value) * Math.cos(angleSlice*i - Math.PI/2); })
                .attr("cy", function(d,i){ return rScale(d.scaled_value) * Math.sin(angleSlice*i - Math.PI/2); })
                .style("fill", "none")
                .style("pointer-events", "all")
                .on("mouseover", function(d,i) { 
                    const str = (d.type == 'categorical')
                                    ? '<div>' + d.axis + ': ' + Math.round(d.value * 100) + '%' + '</div>'
                                    : '<div>' + d.axis + ': ' + Format(d.value) + '</div>';
                    tooltip.html(str);
                    tooltip.show();
                })
                .on("mouseout", function(){
                    tooltip.hide();
                });
        }
    },[data, maxminValue, selectedSubgroups]);

    return(
        <div><svg ref={ref}/></div>
    )
}

export default SpiderChartVis;