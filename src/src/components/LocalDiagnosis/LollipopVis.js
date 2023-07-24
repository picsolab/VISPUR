import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import styled from "styled-components";
import { Select, Button, Space, Table, Card, Badge } from 'antd';

import '../../App.css';
import { LollipopLayout } from '../../layout'

import { purple, grey } from '@material-ui/core/colors';

import d3tooltip from 'd3-tooltip';
const tooltip = d3tooltip(d3);

const LollipopVis = ({
    checkState,
    popImbScore,
    groupImbScore,
    selectedGroupIndex, 
    selectedZNames
}) => {
    const ref = useRef(null);
    useEffect(() => {
        if(popImbScore.length > 0){
            const svg = d3.select(ref.current);
            svg.selectAll('*').remove();

            const { checkedA, checkedB } = checkState;

            // let maxScore = d3.max(popImbScore, d => +d['score']);
            // if (groupImbScore.length > 0){
            //     if (d3.max(groupImbScore, d => +d['score']) > maxScore){
            //         maxScore = d3.max(groupImbScore, d => +d['score']);
            //     }
            // }
        
            const popData = popImbScore
                    .filter(d => selectedZNames.includes(d['varName']))
                    .sort(function(a, b) { return b['score'] - a['score']; }),
                groupData = groupImbScore
                    .filter(d => d['groupIndex'] === selectedGroupIndex)
                    .filter(d => selectedZNames.includes(d['varName']))
            
            let maxScore = d3.max(popData, d => +d['score']);
            if (d3.max(groupData, d => d['score']) > maxScore) {
                maxScore = d3.max(groupData, d => +d['score'])
            }

            // console.log('=== popData/grpData:', popData, groupData);
        
            svg.attr("width", LollipopLayout.width + LollipopLayout.margin.left + LollipopLayout.margin.right)
                .attr("height", LollipopLayout.height + LollipopLayout.margin.top + LollipopLayout.margin.bottom);
            
            var xScale = d3.scaleLinear()
                .domain([0, maxScore])
                .range([0, LollipopLayout.width]);

            // define arrow
            // const markerBoxWidth = 10,
            //         markerBoxHeight = 10,
            //         refX = markerBoxWidth / 2,
            //         refY = markerBoxHeight / 2,
            //         arrowPoints = [[0, 0], [0, 10], [10, 5]];
            // svg.append('defs')
            //     .append('marker')
            //     .attr('id', 'arrow')
            //     .attr('viewBox', [0, 0, markerBoxWidth, markerBoxHeight])
            //     .attr('refX', refX)
            //     .attr('refY', refY)
            //     .attr('markerWidth', markerBoxWidth)
            //     .attr('markerHeight', markerBoxHeight)
            //     .attr('orient', 'auto-start-reverse')
            //     .append('path')
            //     .attr('d', d3.line()(arrowPoints))
            //     .attr('stroke', 'black');
          
            svg.append("g")
                .attr("transform", "translate(" + LollipopLayout.margin.left + "," + 
                                    LollipopLayout.margin.top + ")")
                .attr("class", "llpXAxis")
                .call(d3.axisTop(xScale)
                        .ticks(5)
                        .tickSize(-LollipopLayout.height)
                        .tickFormat(d3.format(".1f"))
                        .tickPadding(8)
                )
                .call(g => g.select(".domain").remove())
                .call(g => g.selectAll(".tick:not(:first-of-type) line")
                            .attr("stroke-opacity", 0.5)
                            .attr("stroke-dasharray", "2.2"));
            
            // svg.append("g")
            //     .attr("transform", "translate(" + LollipopLayout.margin.left + "," + 
            //             LollipopLayout.margin.top + ")")
            //     .attr("class", "llpXAxis")
            //     .call(d3.axisTop(xScale)
            //             .tickSize(0)
            //             .ticks(0))
            //     .call(g => g.select(".domain")
            //                 .attr('marker-start', 'url(#arrow)')
            //                 .attr('marker-end', 'url(#arrow)'));
            
            // add text
            // svg.append("text")
            //   .attr("class", "legendLabels")
            //   .attr("x", 0) // LollipopLayout.margin.left)
            //   .attr("y", LollipopLayout.margin.top - LollipopLayout.padding)
            //   .style("text-anchor", "left")
            //   .text('Good balance');
            
            // svg.append("text")
            //   .attr("class", "legendLabels")
            //   .attr("x", LollipopLayout.margin.left + LollipopLayout.width)
            //   .attr("y", LollipopLayout.margin.top - LollipopLayout.padding)
            //   .style("text-anchor", "right")
            //   .text('Bad balance');
            
            var yScale = d3.scaleBand()
                .range([ 0, LollipopLayout.height])
                .domain(popData.map(d => d['varName']))
                .paddingOuter(0.6)
                .paddingInner(0.8);

            let bandWidth = yScale.bandwidth();
        
            svg.append("g")
                .attr("class", "llpYAxis")
                .attr("transform", "translate(" + LollipopLayout.margin.left + "," + 
                                    LollipopLayout.margin.top + ")")
                .call(d3.axisLeft(yScale).tickSize(0).tickPadding(10));
              
            const poplollipop = svg.selectAll(".poplollipop")
                .data(popData)
                .enter()
                .append("g")
                .attr("class", "poplollipop")
                .attr("transform", 
                    "translate(" + LollipopLayout.margin.left + "," + 
                    (LollipopLayout.margin.top) + ")");
            if (checkedA == true){
                poplollipop
                    .append("line")
                    .attr("x1", function(d) { return xScale(d['score']); })
                    .attr("x2", xScale(0))
                    .attr("y1", function(d) { return yScale(d['varName']) ; })
                    .attr("y2", function(d) { return yScale(d['varName']); })
                    .style("stroke", grey[500]);
        
                poplollipop.append("circle")
                    .attr("cx", function(d) { return xScale(d['score']); })
                    .attr("cy", function(d) { return yScale(d['varName']); })
                    .attr("r", d => d['score'] < 0.2 ? "3" : "8")
                    .style("fill", grey[500])
                    .style("stroke-width", d => d['score'] < 0.2 ? "0.5px" : "2.0px");

                poplollipop.on("mouseover", function(d) {
                    d3.select(this)
                        .selectAll("circle")
                        .transition()
                        .duration(500)
                        .attr("r", 10);
                    d3.select(this)
                        .selectAll("line")
                        .transition()
                        .duration(500)
                        .style("stroke-width", "3px");
                    tooltip.html(
                        "<div>" + d['varName'] + ": " +
                            d3.format('.2f')(d['score']) + "</div>"
                    );
                    tooltip.show();
                }).on("mouseout", function() {
                        d3.select(this)
                            .selectAll("circle")
                            .transition()
                            .duration(500)
                            .attr("r", d => d['score'] < 0.2 ? "3" : "8");
                        d3.select(this)
                            .selectAll("line")
                            .transition()
                            .duration(500)
                            .style("stroke-width", "1px");
                          tooltip.hide();
                });
            }

            const grplollipop = svg.selectAll(".grplollipop")
                .data(groupData)
                .enter()
                .append("g")
                .attr("class","grplollipop")
                .attr("transform", "translate(" + LollipopLayout.margin.left + ',' +
                    (LollipopLayout.margin.top + bandWidth) + ")");
            
            if (checkedB == true){
                grplollipop
                    .append("line")
                    .attr("x1", function(d) { return xScale(d['score']); })
                    .attr("x2", xScale(0))
                    .attr("y1", function(d) { return yScale(d['varName']) ; })
                    .attr("y2", function(d) { return yScale(d['varName']); })
                    .style("stroke", purple[300]);
        
                grplollipop
                    .append("circle")
                    .attr("cx", function(d) { return xScale(d['score']); })
                    .attr("cy", function(d) { return yScale(d['varName']); })
                    .attr("r", d => d['score'] < 0.2 ? "3" : "8")
                    .style("fill", purple[300])
                    .style("stroke-width", d => d['score'] < 0.2 ? "0.5px" : "2.0px");
        
                grplollipop.on("mouseover", function(d) {
                    d3.select(this)
                        .selectAll("circle")
                        .transition()
                        .duration(500)
                        .attr("r", 10);
                    d3.select(this)
                        .selectAll("line")
                        .transition()
                        .duration(500)
                        .style("stroke-width", "3px");
                    tooltip.html(
                        "<div>" + d['varName'] + ": " +
                            d3.format('.2f')(d['score']) + "</div>"
                    );
                    tooltip.show();
                }).on("mouseout", function() {
                    d3.select(this)
                        .selectAll("circle")
                        .transition()
                        .duration(500)
                        .attr("r", d => d['score'] < 0.2 ? "3" : "8");
                    d3.select(this)
                        .selectAll("line")
                        .transition()
                        .duration(500)
                        .style("stroke-width", "1px");
                    tooltip.hide();
                });
            }
            

            // add legend
            // svg.append("circle")
            //     .attr("class", "poplollipop_circle")
            //     .attr("cx", LollipopLayout.width + LollipopLayout.margin.left + 20)
            //     .attr("cy", LollipopLayout.margin.top + 10)
            //     .attr("r", "3");
            // svg.append("text")
            //     .attr("class", "legendLabels")
            //     .attr("x", LollipopLayout.width + LollipopLayout.margin.left + 30)
            //     .attr("y", LollipopLayout.margin.top + 10 + 4)
            //     .style("text-anchor", "left")
            //     .text('population');
              

            // svg.append("circle")
            //     .attr("class", "grplollipop_circle")
            //     .attr("cx", LollipopLayout.width + LollipopLayout.margin.left + 20)
            //     .attr("cy", LollipopLayout.margin.top + 10 + 15)
            //     .attr("r", "3");
            // svg.append("text")
            //     .attr("class", "legendLabels")
            //     .attr("x", LollipopLayout.width + LollipopLayout.margin.left + 30)
            //     .attr("y", LollipopLayout.margin.top + 10 + 15 + 4)
            //     .style("text-anchor", "left")
            //     .text('subgroup');

        }
    },[selectedZNames, popImbScore, groupImbScore, selectedGroupIndex]);

    

    return (
        <div>
            <svg ref={ref} />
        </div>
    );
}

export default LollipopVis;