import * as d3 from 'd3';
import { StorytellingLayout } from '../../layout';

export function link(d) {
    const {x0, x1, y0, y1} = d;
    var curvature = .5;
    var xi = d3.interpolateNumber(x0, x1),
        x2 = xi(curvature),
        x3 = xi(1 - curvature);

    return "M" + x0 + "," + y0
            + "C" + x2 + "," + y0
            + " " + x3 + "," + y1
            + " " + x1 + "," + y1;
}

export function _getNodePositions(groupIndex, summaryData) {
    var groupNodePos = 
        {
            // for rect, (x,y) is the top-left point
            // y = 0.5 * (h - ypadding) + ypadding + 0.5 * nodeHeight (if ypad === 0)
            // ==> h/2 - nodeHeight/2
            'x': StorytellingLayout.xpadding,
            'y': StorytellingLayout.height/2 - 
                    StorytellingLayout.groupNode.height/2,
            'dx': StorytellingLayout.groupNode.width,
            'dy': StorytellingLayout.groupNode.height
        };
    var outcomeNodePos = 
        {
            'x': StorytellingLayout.width - 
                    StorytellingLayout.outcomeNode.width - 
                    StorytellingLayout.xpadding,
            'y': 0.5 * (StorytellingLayout.height - StorytellingLayout.outcomeNode.height),
            'dy': StorytellingLayout.outcomeNode.height
        };

    summaryData = summaryData.filter(d => d.groupIndex === groupIndex);
    const nBins = summaryData.length;
    let causeNodePos = [];
    for(let i=0; i<summaryData.length; i++){
        let causeBinIndex = summaryData[i]['causeBinIndex'];
        causeNodePos.push({
            'causeBinIndex': summaryData[i]['causeBinIndex'],
            'causeBinName': summaryData[i]['causeBinName'],
            'x': (groupNodePos.x + outcomeNodePos.x) / 2, 
            'y': (nBins - causeBinIndex) * (StorytellingLayout.height) / (nBins + 1)
                    - StorytellingLayout.causeNode.maxHeight * summaryData[i].percent * 0.5,
            'dx': StorytellingLayout.causeNode.width,
            'dy': StorytellingLayout.causeNode.maxHeight * summaryData[i].percent
        });
    }
    return {
        'groupIndex': groupIndex,
        'groupName': summaryData[0]['groupName'],
        'groupNodePos': groupNodePos,
        'causeNodePos': causeNodePos,
        'outcomeNodePos': outcomeNodePos
    };
}

export function _getLinkPositions(NodePosForSubgroup, summaryData, data, outcomeVarName){
    const {groupIndex, groupName, 
    groupNodePos, causeNodePos, outcomeNodePos} = NodePosForSubgroup;
    let links = [];
    let x0, x1, y0, y1, thickness, yvalue;
    let offset = 0;
    // for(let i=0; i<causeNodePos.length; i++){
    for(let i=causeNodePos.length-1; i>=0; i--){
        //left-hand side flows
        x0 = groupNodePos.x + groupNodePos.dx;
        y0 = (groupNodePos.y + offset) + 0.5 * causeNodePos[i].dy; // !!!
        x1 = causeNodePos[i].x;
        y1 = causeNodePos[i].y + 0.5 * causeNodePos[i].dy;
        thickness = causeNodePos[i].dy;
        offset = offset + causeNodePos[i].dy;
        links.push({
            'groupIndex': groupIndex,
            'groupName': groupName, 
            'causeBinIndex': causeNodePos[i]['causeBinIndex'],
            'causeBinName': causeNodePos[i]['causeBinName'],
            'type':'ZX',
            'x0':x0,'x1':x1,
            'y0':y0,'y1':y1,
            'thickness':thickness});
    
        // right-hand side flows
        x0 = x1 + causeNodePos[i].dx;
        y0 = y1;
        x1 = outcomeNodePos.x;
        yvalue = summaryData.filter(d => (d.groupIndex === groupIndex & 
                        d.causeBinIndex === causeNodePos[i].causeBinIndex))[0]['outcomeAvg'];
        const yScale = d3
            .scaleLinear()
            .domain([d3.min(data, d => +d[outcomeVarName]), d3.max(data, d => +d[outcomeVarName])])
            .range([StorytellingLayout.height - 0.5 * StorytellingLayout.causeNode.maxHeight, 
                    0 + 0.5 * StorytellingLayout.causeNode.maxHeight]);
        y1 = yScale(yvalue);
        links.push({
            'groupIndex': groupIndex,
            'groupName': groupName,
            'causeBinIndex': causeNodePos[i]['causeBinIndex'],
            'causeBinName': causeNodePos[i]['causeBinName'],
            'type':'XY',
            'x0':x0,'x1':x1,
            'y0':y0,'y1':y1,
            'thickness':thickness});
    }
    return links;
}
