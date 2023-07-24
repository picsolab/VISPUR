import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import styled from "styled-components";
import { Select, Button, Space, Table, Card } from 'antd';

import { _getNodePositions, _getLinkPositions, link } from './util';
import '../../App.css';

import d3tooltip from 'd3-tooltip';
import { StorytellingLayout } from '../../layout';

const tooltip = d3tooltip(d3);

const StoryTellingVis = ({
  groupIndex,
  data,
  summaryData,
  outcomeVar,
}) => {
  const ref = useRef(null);

  useEffect(() => {
    if (summaryData.length > 0){
      
      const outcomeVarName = outcomeVar['name'];

      const svg = d3.select(ref.current);
      svg.selectAll('*').remove();
  
      svg.attr("width", StorytellingLayout.width)
          .attr("height", StorytellingLayout.height);
      
      const nodePosition = _getNodePositions(groupIndex, summaryData);
      const linkPosition = _getLinkPositions(nodePosition, summaryData, data, outcomeVarName);

      const texty = nodePosition['outcomeNodePos']['y'] - 10;
      svg.append("text")
        .attr("class","storytellingNodeLabels")
        .attr("x", nodePosition['groupNodePos']['x'] - 10)
        .attr("y", texty)
        .text("Group");
      svg.append("text")
         .attr("class","storytellingNodeLabels")
         .attr("x", nodePosition['causeNodePos'][0].x - 10)
         .attr("y", texty)
         .text("Cause");
      svg.append("text")
         .attr("class","storytellingNodeLabels")
         .attr("x", nodePosition['outcomeNodePos'].x - 30)
         .attr("y", texty)
         .text("Outcome");
      
      svg.selectAll(".groupNode")
          .data([nodePosition])
          .enter()
          .append("g")
          .attr("class", "groupNode")
          .attr("transform", function(d) {
              return "translate(" + d.groupNodePos.x + "," + d.groupNodePos.y + ")"; })
          .append('rect')
          .attr("width", d => d.groupNodePos.dx) /* strok width is also node height */
          .attr("height", d => d.groupNodePos.dy);
      
      svg.selectAll(".causeNode")
          .data(nodePosition['causeNodePos'])
          .enter()
          .append("g")
          .attr("class", "causeNode")
          .attr("transform", function(d){return "translate(" + d.x + "," + d.y +")"; })
          .append('rect')
          .attr("height", d => d.dy)
          .attr("width", d => d.dx);
      
      // console.log("nodePosition", nodePosition);
      const yDomain = [d3.min(data, d => +d[outcomeVarName]),
      d3.max(data, d => +d[outcomeVarName])];
      const yScale = d3.scaleLinear()
                       .domain(yDomain)
                       .range([ nodePosition['outcomeNodePos']['dy'], 0]);
      svg.append("g")
         .attr("class", "outcomeYAxis")
         .attr("transform", 
                  "translate(" +
                  nodePosition['outcomeNodePos']['x'] + "," +
                  nodePosition['outcomeNodePos']['y'] + ")")
         .call(d3.axisRight(yScale)
                 .tickValues(yDomain)
                 .ticks(3)
                 .tickSize(3)
                 .tickFormat(d3.format(".1f")));
  
    //   svg.selectAll(".groupNode")
    //       .append("text")
    //       .attr("x", +13)
    //       .attr("y", function(d) { return d.groupNodePos.dy / 2; })
    //       .attr("dy", ".35em")
    //       .attr("text-anchor", "start")
    //       .attr("transform", null)
    //       .text(d => d.groupName);
      svg.selectAll(".causeNode")
          .append("text")
          .attr("x", -6)
          .attr("y", function(d) { return d.dy / 2; })
          .attr("dy", ".35em")
          .attr("text-anchor", "end")
          .attr("transform", null)
          .text(function(d) {
          return d.dy > 0 ? d.causeBinName : "";
      });
      const Flows = svg.selectAll(".link")
          .data(linkPosition)
          .enter()
          .append("g")
          .attr("class", "link");
        
      Flows.append("path")
          .attr("d", d => link(d))
          .style("stroke-width", function(d) {
            return d.thickness > 0 ? Math.max(1, d.thickness) : 0;
          })
          .on("mouseover", function (d, i){
              if (d.thickness > 0) {
                  if (d.type === 'ZX') {
                      let percent = summaryData.filter(u => u.groupIndex === d.groupIndex & 
                          u.causeBinIndex === d.causeBinIndex)[0].percent;
                      tooltip.html(
                          "<div>" + "Percent: " + Math.round(percent * 100) + '%' + "</div>"
                      );
                      tooltip.show();
                  } else {
                      const {causeAvg, outcomeAvg} = summaryData.filter(u => u.groupIndex === d.groupIndex & 
                          u.causeBinIndex === d.causeBinIndex)[0];
                      tooltip.html(
                          "<div>" +
                              "<div>" + 
                                  "Avg Cause: " + d3.format('.1f')(causeAvg) +
                              "</div>" +
                              "<div>" +
                                  "Avg Outcome: " + d3.format('.1f')(outcomeAvg) +
                              "</div>" +
                          "</div>"
                      );
                      tooltip.show();
                  }
                  
              }
          })
          .on("mouseout", (d,i) => {
              tooltip.hide();
          });
        
      Flows.append('line')
          .attr('x1', d => d.x1 - 10)
          .attr('x2', d => d.x1 + 10 + StorytellingLayout.outcomeNode.width)
          .attr('y1', d => d.y1)
          .attr('y2', d => d.y1)
          .attr('opacity', function(d) {
            return d.type === 'XY' & d.thickness > 0 ? "1.0" : "0.0";
        });
    }
  }, [summaryData, groupIndex]);

  return (
    <div>
      <svg ref={ref} />
    </div>
  );
}

export default StoryTellingVis;
