import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import {nest} from 'd3-collection';
import styled from "styled-components";
import { Select, Button, Space, Table, Card } from 'antd';
import '../../App.css';

import d3tooltip from 'd3-tooltip';
import { XYSpaceLayout } from '../../layout';
import { seqColorScale, setColor, wrap } from './util'

const tooltip = d3tooltip(d3);

const CircleVis = ({
    data,
    summaryData, 
    regressionData, 
    causeVar, 
    outcomeVar,
    selectedSubgroups,
    setSelectedSubgroups,
    gNames
}) => {

    const ref = useRef(null);
    useEffect(() => {
        if (!_.isEmpty(summaryData) &  
            !_.isEmpty(causeVar) &
            !_.isEmpty(outcomeVar)){
                
            const svg = d3.select(ref.current);
            svg.selectAll('*').remove();
        
            const causeVarName = causeVar['name'], outcomeVarName = outcomeVar['name'];
            const popSummaryData = summaryData['population'], 
                  grpSummaryData = summaryData['subgroup'];
            const popRegressionData = regressionData['population'],
                  grpRegressionData = regressionData['subgroup'];
            const grpNestedSummaryData = nest()
                    .key(d => d['groupIndex'])
                    .entries(grpSummaryData),
                  popNestedSummaryData = nest()
                    .key(d => d['groupIndex'])
                    .entries(popSummaryData);

          
            grpNestedSummaryData.forEach(function(e) {
                e['reg'] = grpRegressionData.filter(u => u['groupIndex'] === +e['key'])[0];
                e['values'].forEach(u => {
                  u['feasible'] = (typeof e['reg'] === 'undefined') ? false : true;
                })
            });

            popNestedSummaryData.forEach(function(e) {
              e['reg'] = popRegressionData.filter(u => u['groupIndex'] === +e['key'])[0];
              e['values'].forEach(u => {
                u['feasible'] = (typeof e['reg'] === 'undefined') ? false : true;
              })
            });
        
            const groups = grpNestedSummaryData.map(d => d['key']);
            const ngroups = groups.length;
        
            svg.attr("width", XYSpaceLayout.width + 
                              XYSpaceLayout.margin.left + 
                              XYSpaceLayout.margin.right)
              .attr("height", XYSpaceLayout.height + 
                              XYSpaceLayout.margin.top + 
                              XYSpaceLayout.margin.bottom);
        
            // put legend
            svg.selectAll(".legendDots")
               .data(groups)
               .enter()
               .append("circle")
               .attr("class","legendDots")
               .attr("cx", XYSpaceLayout.margin.left + 
                            XYSpaceLayout.width + 
                            XYSpaceLayout.circlePadding)
               .attr("cy", function(d, i) {return XYSpaceLayout.margin.top + 30 * i + 20})
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
               .attr("x", XYSpaceLayout.margin.left + 
                          XYSpaceLayout.width + 
                          XYSpaceLayout.circlePadding + 10)
               .attr("y", function(d, i) { return XYSpaceLayout.margin.top + 30 * i + 20})
               .attr("dy", "0.2em")
               .text(d => {return d === 'Population' ? d : 'GroupID ' + d})
               .attr("text-anchor", "left")
               .style("alignment-baseline", "middle")
               .call(wrap, 100);
        
            svg.append("text")
              .attr("class", "axisLabels")
              .attr("x", XYSpaceLayout.width + XYSpaceLayout.margin.left)
              .attr("y", XYSpaceLayout.height + 
                         XYSpaceLayout.margin.top + 
                         XYSpaceLayout.circlePadding)
              .style("text-anchor", "middle")
              .text('Cause: ' + causeVarName);
            
            svg.append("text")
              .attr("class", "axisLabels")
              .attr("transform", "rotate(-90)")
              .attr("y", 0 + XYSpaceLayout.margin.left -
                             XYSpaceLayout.circlePadding - 30)
              .attr("x", 0 - (XYSpaceLayout.margin.top + XYSpaceLayout.width / 6.0))
              .attr("dy", "1em")
              .style("text-anchor", "middle")
              .text('Outcome: ' + outcomeVarName);
        
            const xScale = d3.scaleLinear()
                .domain([d3.min(data, d => +d[causeVarName]), 
                         d3.max(data, d => +d[causeVarName])])
                .range([ 0, XYSpaceLayout.width ]);
            const yScale = d3.scaleLinear()
                // .domain([d3.min(data, d => +d[outcomeVarName]), 
                .domain([4.0, 9.0])
                        //  d3.max(data, d => +d[outcomeVarName])])
                .range([ XYSpaceLayout.height, 0]);
            const zScale = d3.scaleLinear()
                .domain([1, d3.max(popSummaryData, d => +d['size'])])
                .range([ XYSpaceLayout.circle.minRadius, XYSpaceLayout.circle.maxRadius]);
          
            if (causeVar['type'] === "categorical"){
                svg.append("g")
                    .attr("transform", "translate(" + 
                            XYSpaceLayout.margin.left + "," + 
                            (XYSpaceLayout.margin.top + XYSpaceLayout.height) + ")")
                    .attr("class", "xBottom axis")
                    .call(d3.axisBottom(xScale)
                            .tickSize([0])
                            .tickValues([0,1])
                            .tickFormat(d3.format(".0f")))
            } else {
                svg.append("g")
                    .attr("transform", "translate(" + 
                            XYSpaceLayout.margin.left + "," + 
                            (XYSpaceLayout.margin.top + XYSpaceLayout.height) + ")")
                    .attr("class", "xBottom axis")
                    .call(d3.axisBottom(xScale)
                            .tickSize([0])
                            .ticks(4)
                            .tickFormat(d3.format(".1f")))
            }
        
            svg.append("g")
                .attr("transform", "translate(" + 
                            XYSpaceLayout.margin.left + "," + 
                            XYSpaceLayout.margin.top + ")")
                .attr("class", "xTop axis")
                .call(d3.axisTop(xScale)
                        .tickSize([0])
                        .tickValues([]));
            if (outcomeVar['type'] === "categorical") {
                svg.append("g")
                    .attr("transform", "translate(" + 
                            XYSpaceLayout.margin.left + "," + 
                            XYSpaceLayout.margin.top + ")")
                    .attr("class", "yLeft axis")
                    .call(d3.axisLeft(yScale)
                            .tickSize([0])
                            .tickValues([0,1])
                            .tickFormat(d3.format(".0f")));
            } else {
                svg.append("g")
                    .attr("transform", "translate(" + 
                            XYSpaceLayout.margin.left + "," + 
                            XYSpaceLayout.margin.top + ")")
                    .attr("class", "yLeft axis")
                    .call(d3.axisLeft(yScale)
                            .tickSize([0])
                            .ticks(4)
                            .tickFormat(d3.format(".1f")));
            }
            
            svg.append("g")
                .attr("class", "yRight axis")
                .attr("transform", "translate(" + 
                        (XYSpaceLayout.width + XYSpaceLayout.margin.left) + "," + 
                        XYSpaceLayout.margin.top + ")")
                .call(d3.axisRight(yScale)
                        .tickSize([0])
                        .tickValues([]));
        
            /* Each subgroup has a class ID gForSubgroupID_xxx */
            const gForSubgroup = svg.selectAll('.allgroups')
                .data(grpNestedSummaryData)
                .enter()
                .append('g')
                .attr("transform", "translate(" + 
                            XYSpaceLayout.margin.left + "," + 
                            XYSpaceLayout.margin.top + ")")
                .attr('class', (d, i) => 'gForSubgroupID_' + d['key'] + ' allgroups');

            console.log('grpNestedSummaryData: ', grpNestedSummaryData);
            
            const gForPopulation = svg.selectAll(".population")
                .data(popNestedSummaryData)
                .enter()
                .append('g')
                .attr("transform", "translate(" + 
                            XYSpaceLayout.margin.left + "," + 
                            XYSpaceLayout.margin.top + ")")
                .attr('class', 'gForPopulation allgroups');
        
            gForSubgroup.classed("selected", d =>
              selectedSubgroups.has(+d['key']) ? true : false);

            gForPopulation.classed("selected", selectedSubgroups.has('P') ? true : false);
        
            var line = d3.line()
                .x(function(d) { return xScale(+d['cause']); })
                .y(function(d) { return yScale(+d['outcome']); });

            if(ngroups === 0 | gForPopulation.classed("selected")){
              gForPopulation
                .selectAll(".path")
                .data(
                  popNestedSummaryData
                    .filter(d => 
                      (typeof d['values'][0]['outcome'] !== 'undefined') &
                      (typeof d['values'][1]['outcome'] !== 'undefined'))
                )
                .enter()
                .append("path")
                .style("stroke", "gray")
                .style("opacity", function(d){
                  return selectedSubgroups.has("P") ? 1.0 : (ngroups === 0 ? "0.3" : "0.05"); })
                .attr("d", function(d){ return line(d['values']) } )
                .style("stroke-dasharray", function(d) {
                  return d['values'][0]['feasible'] === true ? ("10,0") : ("10,5")
                });

              gForPopulation
                  .selectAll(".circles")
                  .data(d => d['values'])
                  .enter()
                  .append("circle")
                  .attr("class", "circles")
                  .attr("cx", function (d) { return xScale(+d['cause']); } )
                  .attr("cy", function (d) { return yScale(+d['outcome']); } )
                  .attr("r", function (d) { return zScale(+d['size']); } )
                  .style("fill", "gray")
                  .style("opacity", function(d){
                    return selectedSubgroups.has("P") ? 1.0 : (ngroups === 0 ? "0.3" : "0.02"); })
                  .style("stroke-dasharray", function(d) {
                    return d['feasible'] === true ? ("10,0") : ("10,5")
                  }); // make the stroke dashed
            }
          
        
            /* For each subgroup, add circles first */
            gForSubgroup
                .selectAll(".circles")
                .data(d => d['values'])
                .enter()
                .append("circle")
                .attr("class", "circles")
                .attr("cx", function (d) { return xScale(+d['cause']); } )
                .attr("cy", function (d) { return yScale(+d['outcome']); } )
                .attr("r", function (d) { return zScale(+d['size']); } )
                .style("fill", d => setColor(seqColorScale, +d['groupIndex'], ngroups))
                .style("opacity", function(d){
                    return selectedSubgroups.has(+d['groupIndex']) ? 1.0 : 0.3; })
                .style("stroke-dasharray", function(d) {
                  return d['feasible'] === true ? ("10,0") : ("10,5")
                }); // make the stroke dashed
            
            /* For each subgroup, add path */
            gForSubgroup
              .append("path")
              .style("stroke", function(d) { return setColor(seqColorScale, +d['key'], ngroups); } )
              .attr("d", function(d){ return line(d['values']) } )
              .style("stroke-dasharray", function(d) {
                return d["values"][0]['feasible'] === true ? ("10,0") : ("10,5")
              });

            gForSubgroup
                .on("mouseover", function(d) {
                  d3.select(this)
                      .selectAll("circle")
                      .transition()
                      .duration(250)
                      .style("opacity", 1.0);
                  d3.select(this)
                      .selectAll("path")
                      .transition()
                      .duration(250)
                      .style("opacity", 1.0)
                      .style("stroke-width", "3px");
                  
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
                        '<div>Coefficient = ' + coefStr + significant + '</div>' +
                        '<div>Confidence Interval = [' + confStrL + ', ' + confStrR +']</div>'
                    );
                    tooltip.show();
                  } else {
                    tooltip.html('<div>GroupID: ' + d['key'] + '</div>');
                    tooltip.show();
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
                      .style("opacity", "0.3");
                    d3.select(this)
                      .selectAll("path")
                      .transition()
                      .duration(250)
                      .style("opacity", "0.3");
                  }
                });

            gForPopulation
                .on("mouseover", function(d) {
                  d3.select(this)
                      .selectAll("circle")
                      .transition()
                      .duration(250)
                      .style("opacity", 1.0);
                  d3.select(this)
                      .selectAll("path")
                      .transition()
                      .duration(250)
                      .style("opacity", 1.0)
                      .style("stroke-width", "3px");
                  
                  if (typeof d['reg'] !== 'undefined'){
                    const {groupIndex, coef, conf_int, pvalue, nobs} = d['reg'];
                    const coefStr = Math.abs(coef) < 0.01 ? d3.format('.0e')(coef) : d3.format('.2f')(coef),
                          significant = pvalue < 0.05 ? '*' : '',
                          confStrL = Math.abs(conf_int[0]) < 0.01 ? d3.format('.0e')(conf_int[0]) : d3.format('.2f')(conf_int[0]),
                          confStrR = Math.abs(conf_int[1]) < 0.01 ? d3.format('.0e')(conf_int[1]) : d3.format('.2f')(conf_int[1]);
                  
                    tooltip.html(
                        '<div>GroupID ' + 'Population' + '</div>' +
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
                });
            
            gForPopulation
                .on("mouseout", function(d) { 
                  tooltip.hide();
                  if (!d3.select(this).classed("selected")){
                    d3.select(this)
                      .selectAll("circle")
                      .transition()
                      .duration(250)
                      .style("opacity", ngroups === 0 ? "0.3" : "0.02");
                    d3.select(this)
                      .selectAll("path")
                      .transition()
                      .duration(250)
                      .style("opacity", ngroups === 0 ? "0.3" : "0.02");
                  }
                });
            
            gForSubgroup
              .on('click', function(d) {
                  if (!d3.select(this).classed("selected")){
                    d3.select(this).classed("selected", true);
                    setSelectedSubgroups((prevState) => 
                        new Set(prevState.add(+d.key))
                    );

                  } else {
                    d3.select(this).classed("selected", false);
                    setSelectedSubgroups((prevState) => {
                      prevState.delete(+d.key);
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

    },[summaryData, regressionData, selectedSubgroups]);

    return (
        <div>
          <svg 
            ref={ref}
          />
        </div>
      );
}

export default CircleVis;