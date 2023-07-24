import * as d3 from 'd3';
import d3tooltip from 'd3-tooltip';
import { XYSpaceLayout } from '../../layout';

const tooltip = d3tooltip(d3);

export const _getXYMode = (causeVarType, outcomeVarType) => {
    return ((causeVarType === 'continuous') & (outcomeVarType === 'continuous'))
        ? 'Ellipse'
        : 'Circle';
}

export const _getZ = (x, y, features) => {
    return features.filter(d => 
        (d.name !== x.name) 
        && (d.name !== y.name)
    );
}

export const _getFeatureObj = (featureName, features) => {
    return features.filter(d => d.name === featureName)[0];
} 

export const _getFeatureName = (feature) => {
    return feature.name;
}

export const _getFeatureNames = (features) => {
    return features.map(d => d.name);
}

// export function getRandomArbitrary(min, max) {
//     return Math.random() * (max - min) + min;
// }

export function _getBinSize(data, varName, breaks){
    const labels = [...Array(breaks.length + 1).keys()];
    let scale = d3.scaleThreshold()
				  .domain(breaks)
				  .range(labels);
	const mapped = data.map(d => scale(d[varName]));
    return labels.map(l => mapped.filter(d => d === l).length);
}

export function _assignGroupIndex(data, rows){
    let scale, mapped, pastedLabels = [], names, pastedNames = [];
    for(let i=0; i < rows.length; i++){
        const {covariate, breaks, infos} = rows[i];
        if (infos.type == 'categorical'){
            names = [covariate + ': False', covariate + ': True']
        } else {
            let cuts = [infos.range[0], breaks, infos.range[1]].flat(2);
            names = [];
            for(let j = 1; j < cuts.length; j++){
                names.push(covariate + ': [' + 
                    d3.format('.1f')(cuts[j - 1]) + ', ' + 
                    d3.format('.1f')(cuts[j]) + ']');
            }
        }

        // labels = [...Array(breaks.length + 1).keys()];
        scale = d3.scaleThreshold()
                  .domain(breaks)
                  .range(names);
        mapped = data.map(d => scale(+d[covariate]));
        if (pastedLabels.length > 0){
            for(let j=0; j<data.length; j++){
                pastedLabels[j] = pastedLabels[j].toString() + "; " + mapped[j].toString();
            }
        } else {
            pastedLabels = mapped;
        }
    }
    let g = 0;
    let mp = new Map();
    let gIndex = [];
    let gNames = [];
    for(let i=0; i<data.length; i++){
        if (mp.has(pastedLabels[i]) === false){
            mp.set(pastedLabels[i], g);
            gNames.push(pastedLabels[i]);
            g++;
        }
        gIndex.push(mp.get(pastedLabels[i]));
    }
    return {'gIndex': gIndex, 'gNames': gNames};
}

function * range( start, end, step ) {
    let state = start;
    while ( state <= end ) {
      yield state;
      state += step;
    }
    return;
  };
export const generate_array = (start,end,step) => Array.from( range(start,end,step) );

export const _renderHistogram = (z, x, zIdx, data, refs) => {
    let xName, xLabels, zValuesOnX;
    
    if (x.type == 'continuous') { // Binarize continuous variables
        [ xName, xLabels ] = [ x.name, [0, 1] ];// [0,1] as lower or higher than the threshold

        // For those whose values are higher than the threshold
        zValuesOnX = data
            .filter(d => d[xName] > x.cutPoint)
            .map(d => d[z.name]);
        if (zValuesOnX.length > 0)
        renderConditionalHistogram(z, zValuesOnX, 0, x);

        // For those whose values are lower than the threshold
        zValuesOnX = data
            .filter(d => d[xName] <= x.cutPoint)
            .map(d => d[z.name]);
        if (zValuesOnX.length > 0)
        renderConditionalHistogram(z, zValuesOnX, 1, x);
    } else {
        [ xName, xLabels ] = [ x.name, x.label ];

        xLabels.forEach(xLabel => {
        zValuesOnX = data
            .filter(d => d[xName]==xLabel)
            .map(d => d[z.name]);
    
        if (zValuesOnX.length > 0)
        renderConditionalHistogram(z, zValuesOnX, xLabel, x);
        });
    }
    
    function renderConditionalHistogram(z, zValues, xLabel, x) {
        let zName, zRange, zLabels;
        let nBins, min, max, step, thresholds;

        if (z.type == 'categorical') {
            [ zName, zLabels ] = [ z.name, z.label.sort((a,b) => d3.ascending(a, b)) ];
            zRange = [zLabels[0], zLabels[zLabels.length - 1]];
            thresholds = zLabels;
        } else if (z.type === 'continuous') {
            [ zName, zRange ] = [ z.name, z.range ];

            nBins = 10;
            min = zRange[0];
            max = zRange[1];
            step = ((max - min) / nBins);
            thresholds = d3.range(min, max, step);
        }

        const svg = d3.select(refs[zIdx].current);

        const dataBin = d3
            .histogram()
            .domain(zRange)
            .thresholds(thresholds)(zValues);

        // Both groups share the same x and y scale
        const xScale = d3
                .scaleLinear()
                .domain([0, z.type === 'categorical' 
                                ? 1 : d3.max(dataBin.map(d => d.length)) / zValues.length])
                .range([0, 40]);
        const yScale = d3
                .scaleBand()
                .domain(dataBin.map(d => d.x0))
                .range([0, 40]);
        const gHist = svg
        
        const dataHistogram = gHist
            .selectAll('.g_hist_for_z_' + zName + ' g_hist_' + xLabel)
            .data(dataBin);

        dataHistogram.exit().remove();

        const shift = parseInt(xLabel) === 0 ? 0 : 40;
        dataHistogram
            .enter()
            .append('g')
            .attr('class', 'g_hist g_hist_for_z_' + zName + ' g_hist_' + xLabel)
            .attr('transform', d => 'translate(' + shift + ',' + yScale(d.x0) + ')')
            .each(function(d) {
                d3.select(this)
                .append('rect')
                .attr('class', 'rect_hist rect_hist_for_z_' + zName)
                .attr('x', 0)
                .attr('y', 0)
                .attr('height', yScale.bandwidth() - 0.5)
                .attr(
                    'width',
                    d => xScale(d.length / zValues.length)
                )
                .style('fill', parseInt(xLabel) === 0 ? '#2c7fb8' : 'purple')
                .on('mouseover', (e) => {
                    if (x['type'] === 'continuous'){
                    let s = xLabel === 0 ? '<' : '>';
                    if (z['type'] === 'continuous'){
                        tooltip.html(
                        '<div>Group:' + x['name'] + s + d3.format('.2f')(x['cutPoint']) + '</div>' +
                        // '<div>Range: [' + d3.format('.2f')(d.x0) + ',' + d3.format('.2f')(d.x1) + ']</div>' +
                        '<div>Prob:' + d3.format('.2f')(d.length / zValues.length) + '</div>'
                        );
                    } else {
                        tooltip.html(
                        '<div>Group:' + x['name'] + s + d3.format('.2f')(x['cutPoint']) + '</div>' +
                        // '<div>Range: [' + (d.x0) + ',' + (d.x1) + ']</div>' +
                        '<div>Prob:' + d3.format('.2f')(d.length / zValues.length) + '</div>'
                        );
                    }
                    } else {
                    if (z['type'] === 'continuous'){
                        tooltip.html(
                        '<div>Group:' + x['name'] + '=' + xLabel + '</div>' +
                        // '<div>Range: [' + d3.format('.2f')(d.x0) + ',' + d3.format('.2f')(d.x1) + ']</div>' +
                        '<div>Prob:' + d3.format('.2f')(d.length / zValues.length) + '</div>'
                        );
                    } else {
                        tooltip.html(
                        '<div>Group:' + x['name'] + '=' + xLabel + '</div>' +
                        // '<div>Range: [' + (d.x0) + ',' + (d.x1) + ']</div>' +
                        '<div>Prob:' + d3.format('.2f')(d.length / zValues.length) + '</div>'
                        );
                    }
                    }
                    
                    tooltip.show();
                })
                .on('mouseout', (e) => {
                    tooltip.hide();
                })
            });
    };
    }

export function _calcSummaryDataForStorytelling(
    GroupIDList, data, causeVarName, outcomeVarName, causeType){

    let nBins = causeType === "continuous" ? 4 : 2;
    let xScale = d3.scaleQuantize()
        .domain([d3.min(data, d => +d[causeVarName]), d3.max(data, d => +d[causeVarName])])
        .range(Array.from(Array(nBins).keys()));
    data.map(d => d['causeBin'] = xScale(+d[causeVarName]));

    let selectedData, percent, causeAvg, outcomeAvg;
    let summaryData = [];
    if (GroupIDList.length === 0){
        for(let i=0; i<nBins; i++){
            selectedData = data.filter(d => d['causeBin'] === i);
            percent = selectedData.length / data.length;
            causeAvg = selectedData.length === 0 ? 0 
                : d3.mean(selectedData, d => +d[causeVarName]);
            outcomeAvg = selectedData.length === 0 ? 0 
                : d3.mean(selectedData, d => +d[outcomeVarName]);
            summaryData.push({
                'groupIndex': 'P',
                'groupName': 'population',
                'causeBinIndex': i,
                'causeBinName': 'CauseBin #' + (i + 1),
                'percent': percent,
                'causeAvg': causeAvg,
                'outcomeAvg': outcomeAvg
            });
        }
        return summaryData;
    } else {
        let groups = [...new Set(GroupIDList)];
        let g, groupData;
        for(let i=0; i<groups.length; i++){
            g = groups[i];
            groupData = data.filter((d,j) => GroupIDList[j] === g);
            for(let j=0; j<nBins; j++){
                selectedData = groupData.filter(d => d['causeBin'] === j);
                percent = selectedData.length / groupData.length;
                causeAvg = selectedData.length === 0 ? 0 : d3.mean(selectedData, d => +d[causeVarName]);
                outcomeAvg = selectedData.length === 0 ? 0 : d3.mean(selectedData, d => +d[outcomeVarName]);
                summaryData.push({
                'groupIndex': g,
                'groupName': 'GroupID ' + g,
                'causeBinIndex': j,
                'causeBinName': 'CauseBin #' + (j + 1),
                'percent': percent,
                'causeAvg': causeAvg,
                'outcomeAvg': outcomeAvg
                });
            }
        }
        return summaryData;
    }
}

export function _calcForXYSpaceCircle(GroupIDList, data, causeVar, outcomeVar){
    const causeVarName = causeVar['name'],
          outcomeVarName = outcomeVar['name'],
          causeVarType = causeVar['type'];
    
    let summaryData = [];
    if (GroupIDList.length === 0){
        if (causeVarType === 'categorical'){
            for(let i=0; i<2; i++){
                let subData = data.filter(d => parseInt(d[causeVarName]) === i);
                summaryData.push({
                    'groupIndex': 0,
                    'cause': i,
                    'outcome': d3.mean(subData, d => +d[outcomeVarName]),
                    'size': subData.length
                });
            }
        } else {
            for(let i=0; i<2; i++){
                let subData = data.filter(d => parseInt(d[outcomeVarName]) === i);
                summaryData.push({
                    'groupIndex': 0,
                    'cause': d3.mean(subData, d => +d[causeVarName]),
                    'outcome': i,
                    'size': subData.length
                });
            }
        }
    } else {
        const groups = [...new Set(GroupIDList)];
        let groupData;
        for (let i=0; i<groups.length; i++){
            groupData = data.filter((d,j) => GroupIDList[j] === groups[i]);
            if (causeVarType === 'categorical'){
                for(let j=0; j<2; j++){
                    let subData = groupData.filter(d => parseInt(d[causeVarName]) === j);
                    summaryData.push({
                        'groupIndex': i,
                        'cause': j,
                        'outcome': d3.mean(subData, d => +d[outcomeVarName]),
                        'size': subData.length
                    });
                }
            } else {
                for(let j=0; j<2; j++){
                    let subData = groupData.filter(d => parseInt(d[outcomeVarName]) === j);
                    summaryData.push({
                        'groupIndex': i,
                        'cause': d3.mean(subData, d => +d[causeVarName]),
                        'outcome': j,
                        'size': subData.length
                    });
                }
            }
        }
    }
    return summaryData;
}

export function _calcForXYSpaceContinuous(GroupIDList, data, ellipseParams){
    let summaryData = {};
    if (GroupIDList.length > 0){
        const groups = [...new Set(GroupIDList)];
        for (let i=0; i<groups.length; i++){
            summaryData[groups[i]] = {
                "data": data.filter((d, j) => GroupIDList[j] === groups[i]),
                "params": ellipseParams.filter(d => d.groupIndex === groups[i])
            }
        }
    } else {
        summaryData[0] = {
            "data": data,
            "params": ellipseParams
        }
    }
    
    summaryData = Object.entries(summaryData).map(
        ([key, values]) => ({ 
            "groupIndex": parseInt(key), 
            "data": values["data"].map(function(d){
                d['groupIndex'] = parseInt(key);
                return d;
            }),
            "params": values["params"] }
    ));
    return summaryData;
}

export function _calcSummaryDataForCovariateSpace(GroupIDList, data, selectedZVars){
  
    let result = [];
    if(GroupIDList.length === 0){
      for(let i=0; i<selectedZVars.length; i++){
          result.push(_calcRadarChartValue(selectedZVars[i], data, 'P'));
      }
    } else {
      const groupIndices = [...new Set(GroupIDList)];
      const subDataList = groupIndices.map(
        g => data.filter((d,i) => GroupIDList[i] === g));
      for(let i=0; i<subDataList.length; i++){
          for(let j=0; j<selectedZVars.length; j++){
              result.push(_calcRadarChartValue(selectedZVars[j], subDataList[i], i));
          }
      }
    }
    return result.flat();
  }
  
  export function _calcRadarChartValue(selectedZVar, subdata, groupIndex){
    const {name, type} = selectedZVar;
    if (type == 'continuous'){
      return {
        'groupIndex': groupIndex,
        'axis': name,
        'value': d3.median(subdata, d => d[name])
      };
    } else {
        const { label } = selectedZVar;
        let result = [], value;
        for (let i=0; i<label.length - 1; i++){
            value = subdata.filter(d => d[name] === label[i]).length / subdata.length;
            result.push({
                'groupIndex': groupIndex,
                'axis': name + '_' + label[i],
                'value': value
            });
        }
        return result;
    }
  }

export function _feasibilityInspect(
    data, 
    GroupIDList, 
    causeVarName,
    causeVarType){
        let feasibility = [];
        const groups = [...new Set(GroupIDList)];
        groups.forEach((g, i) => {
            const gdata = data.filter((d, j) => GroupIDList[j] === g);
            if(causeVarType === 'continuous'){
                feasibility[i] = {
                    'groupIndex': g,
                    'feasible': d3.deviation(gdata, d => d[causeVarName]) === 0 ? false : true
                };  
            } else {
                const p = d3.sum(gdata, d => d[causeVarName]) / gdata.length;
                feasibility[i] = {
                    'groupIndex': g,
                    'feasible': (p === 0 | p === 1) ? false : true
                };
            }
        });
        return feasibility
                    .filter(d => d['feasible'] === true)
                    .map(d => d['groupIndex']);
}