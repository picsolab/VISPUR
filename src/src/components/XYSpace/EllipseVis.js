import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import styled from "styled-components";
import { Select, Button, Space, Table, Card } from 'antd';
import '../../App.css';

import d3tooltip from 'd3-tooltip';
import { XYSpaceLayout } from '../../layout';
import { setColor, toDegrees, seqColorScale, unitX } from './util';

const tooltip = d3tooltip(d3);

const EllipseVis = ({
    GroupIDList,
    data,
    summaryData,
    regressionData,
    causeVarName,
    outcomeVarName,
    selectedSubgroups,
    setSelectedSubgroups,
    gNames
}) => {

    const ref = useRef(null);
    useEffect(() => {
        if (!_.isEmpty(summaryData['population'])){

            // console.log("...summaryData:", summaryData);
            // console.log("...regressionData:", regressionData);

            const opacity_moused = 1.0, opacity_mouseout = 0.8;
            const stroke_width_moused = '5px', stroke_width_mouseout = '3px';
            const stroke_reg_width_moused = '2px', stroke_reg_width_mouseout = '0.5px';
            
            // put regression result to each group

            const popSummaryData = summaryData['population'],
                    grpSummaryData = summaryData['subgroup'];
            const popRegressionData = regressionData['population'],
                    grpRegressionData = regressionData['subgroup'];
            grpSummaryData.forEach(e => {
                e['reg'] = grpRegressionData.filter(d => d['groupIndex'] === e['groupIndex'])[0];
                e['params'].forEach(u => {
                    u['feasible'] = (typeof e['reg'] === 'undefined') ? false : true;
                    u['coef'] = (typeof e['reg'] === 'undefined') ? 0 : e['reg']['coef'];
                });
            });
            popSummaryData.forEach(e => {
                e['reg'] = popRegressionData.filter(d => d['groupIndex'] === e['groupIndex'])[0];
                e['params'].forEach(u => {
                    u['feasible'] = (typeof e['reg'] === 'undefined') ? false : true;
                    u['coef'] = (typeof e['reg'] === 'undefined') ? 0 : e['reg']['coef'];
                });
            });

            const svg = d3.select(ref.current);
            svg.selectAll('*').remove();
        
            svg.attr("width", XYSpaceLayout.width + XYSpaceLayout.margin.left + XYSpaceLayout.margin.right)
               .attr("height", XYSpaceLayout.height + XYSpaceLayout.margin.top + XYSpaceLayout.margin.bottom);
        
            const groups = [...new Set(GroupIDList)].sort();
            const ngroups = groups.length;
            
            svg.selectAll(".legendDots")
               .data(groups)
               .enter()
               .append("circle")
               .attr("class","legendDots")
               .attr("cx", XYSpaceLayout.margin.left + XYSpaceLayout.width + XYSpaceLayout.circlePadding)
               .attr("cy", function(d, i) {return XYSpaceLayout.margin.top + 25 * (i + 1)})
               .attr("r", 5)
               .style("fill", (d, i) => {return setColor(seqColorScale, i, ngroups)})
               .on("mouseover", function(d) {
                    tooltip.html(
                    '<div>GroupID ' + d + '</div>' +
                    '<div>' +
                        gNames[d].split("; ").map(
                        function(e){
                            return  e + '<br />';
                        }).join(' ') + '</div>' 
                        );
                    tooltip.show();
             })
             .on("mouseout", function(d) {
                    tooltip.hide();
             });

            svg.selectAll(".legendLabels")
               .data(groups)
               .enter()
               .append("text")
               .attr("class","legendLabels")
               .attr("x", XYSpaceLayout.margin.left + XYSpaceLayout.width + XYSpaceLayout.circlePadding + 10)
               .attr("y", function(d, i) { return XYSpaceLayout.margin.top + 25 * (i + 1)})
               .text(d => {return d === "Population" ? d : 'GroupID ' + d})
               .attr("text-anchor", "left")
               .style("alignment-baseline", "middle");
        
            svg.append("text")
               .attr("class", "axisLabels")
               .attr("x", XYSpaceLayout.width/2 + XYSpaceLayout.margin.left)
               .attr("y", XYSpaceLayout.height + 
                          XYSpaceLayout.margin.top + 
                          XYSpaceLayout.circlePadding)
               .style("text-anchor", "right")
               .text('Cause: ' + causeVarName);
             
            svg.append("text")
               .attr("class", "axisLabels")
               .attr("transform", "rotate(-90)")
               .attr("y", 0 + XYSpaceLayout.margin.left - 
                              XYSpaceLayout.circlePadding - 30)
               .attr("x", 0 - (XYSpaceLayout.height / 2 + XYSpaceLayout.margin.top))
               .attr("dy", "1em")
               .style("text-anchor", "right")
               .text('Outcome: ' + outcomeVarName);
        
            const xDev = d3.deviation(data, d => +d[causeVarName]),
                  yDev = d3.deviation(data, d => +d[outcomeVarName]),
                  xMin = d3.min(data, d => +d[causeVarName]) - 0.5 * xDev,
                  xMax = d3.max(data, d => +d[causeVarName]) + 0.5 * xDev,
                  yMin = d3.min(data, d => +d[outcomeVarName]) - 2 * yDev,
                  yMax = d3.max(data, d => +d[outcomeVarName]) + 2 * yDev;
            
            // Add X axis
            var xScale = d3
                .scaleLinear()
                .domain([ xMin, xMax ])
                .range([ 0, XYSpaceLayout.width ]);
            svg.append("g")
                .attr("transform", "translate(" + XYSpaceLayout.margin.left + "," +
                                    (XYSpaceLayout.height + XYSpaceLayout.margin.top) + ")")
                .attr("class", "xBottom axis")
                .call(d3.axisBottom(xScale)
                        .tickSize([0])
                        .ticks(5)
                        .tickFormat(d3.format(".1f")));
            svg.append("g")
                .attr("transform", "translate(" + XYSpaceLayout.margin.left + "," +
                                   XYSpaceLayout.margin.top + ")")
                .attr("class", "xTop axis")
                .call(d3.axisTop(xScale)
                        .tickSize([0])
                        .tickValues([]));
            
            // Add Y axis
            var yScale = d3
                .scaleLinear()
                .domain([yMin, yMax])
                .range([ XYSpaceLayout.height, 0]);
        
            svg.append("g")
                .attr("transform", "translate(" + 
                            XYSpaceLayout.margin.left + "," +
                            XYSpaceLayout.margin.top + ")")
                .attr("class", "yLeft axis")
                .call(d3.axisLeft(yScale)
                        .tickSize([0])
                        .ticks(4)
                        .tickFormat(d3.format(".1f")));
            svg.append("g")
                .attr("transform", "translate(" + (XYSpaceLayout.margin.left + XYSpaceLayout.width) + "," +
                                    XYSpaceLayout.margin.top + ")")
                .attr("class", "yRight axis")
                .call(d3.axisRight(yScale)
                        .tickSize([0])
                        .tickValues([]));
            
            const gForSubgroup = svg.selectAll(".allElligroups")
                .data(grpSummaryData)
                .enter()
                .append("g")
                .attr("transform", "translate(" + XYSpaceLayout.margin.left + "," + 
                                    XYSpaceLayout.margin.top + ")")
                .attr('class', (d, i) => 'gForSubgroupID_' + d['groupIndex'] + ' allElligroups');

            const gForPopulation = svg.selectAll(".population")
                .data(popSummaryData)
                .enter()
                .append("g")
                .attr("transform", "translate(" + XYSpaceLayout.margin.left + "," + 
                                    XYSpaceLayout.margin.top + ")")
                .attr('class', 'gForPopulation allElligroups');
                    
            gForSubgroup.classed("selected", d =>
                selectedSubgroups.has(+d['groupIndex']) ? true : false);
            gForPopulation.classed("selected", 
                selectedSubgroups.has('P') ? true : false);
                    
            if (ngroups === 0){
                gForPopulation
                .selectAll(".circles")
                .data(d => d.data)
                .enter()
                .append("circle")
                .attr("class", "circles")
                .attr("cx", function (d) { return xScale(d[causeVarName]); } )
                .attr("cy", function (d) { return yScale(d[outcomeVarName]); } )
                .attr("r", 3);
            }
            
            if(ngroups === 0 | gForPopulation.classed("selected")){
                gForPopulation
                    .selectAll(".ellipses")
                    .data(d => d.params)
                    .enter()
                    .append("ellipse")
                    .attr("cx", d => xScale(d["xc"]))
                    .attr("cy", d => yScale(d["yc"]))
                    .attr("rx", d => Math.abs(xScale(d["xc"] + d["a"]) - xScale(d["xc"])))
                    .attr("ry", d => Math.abs(yScale(d["yc"] + d["b"]) - yScale(d["yc"])))
                    .attr("transform", d => "rotate(" +
                        toDegrees(d["theta"]) + "," +
                        xScale(d["xc"]) + "," +
                        yScale(d["yc"]) + ")")
                    .style("stroke", "gray")
                    .style("stroke-opacity", function(d){
                        return selectedSubgroups.has('P') ? opacity_moused 
                            : (ngroups === 0 ? opacity_mouseout : "0.05"); })
                    .style("stroke-width", function(d){
                        return selectedSubgroups.has('P') ? stroke_width_moused 
                            : (ngroups === 0 ? stroke_width_mouseout : 0.1); })
                    .style("stroke-dasharray", function(d) {
                        return d['feasible'] === true ? ("10,0") : ("10,5") 
                    });
                gForPopulation
                    .selectAll(".line")
                    .data(d => d.params)
                    .enter()
                    .append("line")
                    .attr("x1", xScale(xMin))
                    .attr("y1", d => yScale(
                        (d["coef"] * xMin) + (d["yc"] - d["coef"] * d["xc"])
                    ))
                    .attr("x2", xScale(xMax))
                    .attr("y2", d => yScale(
                        (d["coef"] * xMax) + (d["yc"] - d["coef"] * d["xc"])
                    ))
                    .style("stroke", "gray")
                    .style("stroke-opacity", function(d){
                        return selectedSubgroups.has('P')
                            ? opacity_moused : opacity_mouseout; })
                    .style("stroke-width", function(d){
                        return selectedSubgroups.has('P')
                            ? stroke_reg_width_moused : stroke_reg_width_mouseout; })
            }
            
            gForSubgroup
                .selectAll(".circles")
                .data(d => d.data)
                .enter()
                .append("circle")
                .attr("class", "circles")
                .attr("cx", function (d) { return xScale(d[causeVarName]); } )
                .attr("cy", function (d) { return yScale(d[outcomeVarName]); } )
                .attr("r", 3);
            
            gForSubgroup
                .selectAll(".ellipses")
                .data(d => d.params)
                .enter()
                .append("ellipse")
                .attr("cx", d => xScale(d["xc"]))
                .attr("cy", d => yScale(d["yc"]))
                .attr("rx", d => Math.abs(xScale(d["xc"] + d["a"]) - xScale(d["xc"])))
                .attr("ry", d => Math.abs(yScale(d["yc"] + d["b"]) - yScale(d["yc"])))
                .attr("transform", d => "rotate(" +
                    toDegrees(d["theta"]) + "," +
                    xScale(d["xc"]) + "," +
                    yScale(d["yc"]) + ")")
                .style("stroke", d => setColor(seqColorScale, +d['groupIndex'], ngroups))
                .style("stroke-opacity", function(d){
                    return selectedSubgroups.has(+d['groupIndex']) 
                        ? opacity_moused : opacity_mouseout; })
                .style("stroke-width", function(d){
                    return selectedSubgroups.has(+d['groupIndex']) 
                        ? stroke_width_moused : stroke_width_mouseout; })
                .style("stroke-dasharray", function(d) {
                    return d['feasible'] === true ? ("10,0") : ("10,5") 
                });

            // define arrow
            // const markerBoxWidth = 12,
            //         markerBoxHeight = 12,
            //         refX = markerBoxWidth / 2,
            //         refY = markerBoxHeight / 2;
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
            //     .attr("d", "M2,2 L10,6 L2,10 L6,6 L2,2")
            //     .style("fill", "#f00");

            // gForSubgroup
            //     .selectAll(".line")
            //     .data(d => d.params)
            //     .enter()
            //     .append("line")
            //     .attr("x1", d => xScale(d["xc"]))
            //     .attr("y1", d => yScale(d["yc"]))
            //     .attr("x2", d => xScale(d["xc"] + unitX(d["coef"]) ))
            //     .attr("y2", d => yScale(d["yc"] + unitX(d["coef"]) * d["coef"] ))
            //     .attr("stroke-width",2)  
            //     .attr("stroke", "black")
            //     .attr("marker-end","url(#arrow)")
            //     .style("fill", "black");

            gForSubgroup
                .selectAll(".line")
                .data(d => d.params)
                .enter()
                .append("line")
                .attr("x1", xScale(xMin))
                .attr("y1", d => yScale(
                    (d["coef"] * xMin) + (d["yc"] - d["coef"] * d["xc"])
                ))
                .attr("x2", xScale(xMax))
                .attr("y2", d => yScale(
                    (d["coef"] * xMax) + (d["yc"] - d["coef"] * d["xc"])
                ))
                .style("stroke", d => setColor(seqColorScale, +d['groupIndex'], ngroups))
                .style("stroke-opacity", function(d){
                    return selectedSubgroups.has(+d['groupIndex']) 
                        ? opacity_moused : opacity_mouseout; })
                .style("stroke-width", function(d){
                    return selectedSubgroups.has(+d['groupIndex']) 
                        ? stroke_reg_width_moused : stroke_reg_width_mouseout; })
                    
            gForSubgroup
                .on("mouseover", function(d) {
                    d3.select(this)
                        .selectAll("circle")
                        .transition()
                        .duration(250)
                        .style("opacity", 1.0);
                    d3.select(this)
                        .selectAll("ellipse")
                        .transition()
                        .duration(100)
                        .style("stroke-width", stroke_width_moused)
                        .style("opacity", 1.0);
                    d3.select(this)
                        .selectAll("line")
                        .transition()
                        .duration(100)
                        .style("stroke-width", stroke_reg_width_moused)
                        .style("opacity", 1.0);
                    
                    if (typeof d['reg'] !== 'undefined'){
                        const {groupIndex, coef, conf_int, pvalue, nobs} = d['reg'];
                        const coefStr = Math.abs(coef) < 0.01 ? d3.format('.0e')(coef) : d3.format('.2f')(coef),
                            significant = pvalue < 0.05 ? '*' : '',
                            confStrL = Math.abs(conf_int[0]) < 0.01 ? d3.format('.0e')(conf_int[0]) : d3.format('.2f')(conf_int[0]),
                            confStrR = Math.abs(conf_int[1]) < 0.01 ? d3.format('.0e')(conf_int[1]) : d3.format('.2f')(conf_int[1]);
                    
                        tooltip.html(
                            '<div>GroupID ' + groupIndex + '</div>' +
                            '<div>' +
                                gNames[groupIndex].split("; ").map(
                                    function(e){
                                    return e + '<br />';
                                    }
                                ).join(' ') + 
                            '</div>' +
                            '<div> n_samples = ' + nobs + '</div>' +
                            '<br/>' +
                            '<div>Coefficent = ' + coefStr + significant + '</div>' +
                            '<div>Confidence Interval = [' + confStrL + ', ' + confStrR +']</div>'
                        );
                        tooltip.show();
                    } else {
                        tooltip.html('<div>GroupID ' + d['key'] + '</div>');
                        tooltip.show();
                    }
                });
            
            gForPopulation
                .on("mouseover", function(d) {
                    if(ngroups === 0 | d3.select(this).classed("selected")){
                        d3.select(this)
                            .selectAll("circle")
                            .transition()
                            .duration(250)
                            .style("opacity", 1.0);
                        d3.select(this)
                            .selectAll("ellipse")
                            .transition()
                            .duration(100)
                            .style("stroke-width", stroke_width_moused)
                            .style("opacity", 1.0);
                        d3.select(this)
                            .selectAll("line")
                            .transition()
                            .duration(100)
                            .style("stroke-width", stroke_reg_width_moused)
                            .style("opacity", 1.0);
                        
                        if (typeof d['reg'] !== 'undefined'){
                            const {groupIndex, coef, conf_int, pvalue, nobs} = d['reg'];
                            const coefStr = Math.abs(coef) < 0.01 ? d3.format('.0e')(coef) : d3.format('.2f')(coef),
                                significant = pvalue < 0.05 ? '*' : '',
                                confStrL = Math.abs(conf_int[0]) < 0.01 ? d3.format('.0e')(conf_int[0]) : d3.format('.2f')(conf_int[0]),
                                confStrR = Math.abs(conf_int[1]) < 0.01 ? d3.format('.0e')(conf_int[1]) : d3.format('.2f')(conf_int[1]);
                        
                            tooltip.html(
                                '<div>GroupID Population</div>' +
                                '<div> n_samples = ' + nobs + '</div>' +
                                '<br/>' +
                                '<div>Coefficient = ' + coefStr + significant + '</div>' +
                                '<div>Confidence Interval = [' + confStrL + ', ' + confStrR +']</div>'
                            );
                            tooltip.show();
                        } else {
                            tooltip.html('<div>GroupID: ' + d['key'] + '</div>');
                            tooltip.show();
                        }
                    }
                });
            
            gForSubgroup
                .on('mouseout', function(d) {
                  tooltip.hide();
                  if (!d3.select(this).classed("selected")){
                    d3.select(this)
                      .selectAll("circle")
                      .transition()
                      .duration(250)
                      .style("opacity", "0.1");
                    d3.select(this)
                      .selectAll("ellipse")
                      .transition()
                      .duration(250)
                      .style("opacity", opacity_mouseout)
                      .style("stroke-width", stroke_width_mouseout);
                    d3.select(this)
                      .selectAll("line")
                      .transition()
                      .duration(250)
                      .style("opacity", opacity_mouseout)
                      .style("stroke-width", stroke_reg_width_mouseout);
                  }
                });
            gForPopulation
                .on('mouseout', function(d) {
                  tooltip.hide();
                  if (!d3.select(this).classed("selected")){
                    d3.select(this)
                      .selectAll("circle")
                      .transition()
                      .duration(250)
                      .style("opacity", "0.1");
                    d3.select(this)
                      .selectAll("ellipse")
                      .transition()
                      .duration(250)
                      .style("opacity", opacity_mouseout)
                      .style("stroke-width", stroke_width_mouseout);
                    d3.select(this)
                      .selectAll("line")
                      .transition()
                      .duration(250)
                      .style("opacity", opacity_mouseout)
                      .style("stroke-width", stroke_reg_width_mouseout);
                  }
                });
                    
            gForSubgroup
              .on('click', function(d) {
                  if (!d3.select(this).classed("selected")){
                    d3.select(this).classed("selected", true);
                    setSelectedSubgroups((prevState) => 
                        new Set(prevState.add(+d.groupIndex))
                    );

                  } else {
                    d3.select(this).classed("selected", false);
                    setSelectedSubgroups((prevState) => {
                      prevState.delete(+d.groupIndex);
                      return new Set(prevState);
                    });
                  }
              });
            
            gForPopulation
              .on('click', function(d) {
                  if (!d3.select(this).classed("selected")){
                    d3.select(this).classed("selected", true);
                    setSelectedSubgroups((prevState) => 
                        new Set(prevState.add('P'))
                    );

                  } else {
                    d3.select(this).classed("selected", false);
                    setSelectedSubgroups((prevState) => {
                      prevState.delete('P');
                      return new Set(prevState);
                    });
                  }
              });
        }
    }, [summaryData, regressionData, GroupIDList, selectedSubgroups]);

    return (
        <div>
          <svg 
            ref={ref}
          />
        </div>
    );
}
export default EllipseVis;