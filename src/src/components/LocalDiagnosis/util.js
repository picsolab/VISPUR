// import { withThemeCreator } from '@material-ui/styles';
import * as d3 from 'd3';
import d3tooltip from 'd3-tooltip';
import { LollipopLayout } from '../../layout'

import Switch from '@material-ui/core/Switch';
import { purple, grey } from '@material-ui/core/colors';
import { withStyles } from '@material-ui/core/styles';

const tooltip = d3tooltip(d3);

export function _getDataSource(popRegressionData, groupRegressionData, selectedGroupIndex){
    const reg1 = popRegressionData[0],
          reg2 = groupRegressionData.filter(u => u['groupIndex'] === selectedGroupIndex)[0];
    let sp_flag = null;
    if(typeof reg2 !== 'undefined'){
        sp_flag = reg1.coef * reg2.coef < 0 ? true : false;
    }

    const {coef, conf_int, pvalue, nobs} = reg1;
    let result = [
        {  
            'property': 'Coefficient',
            'pop_value': Math.abs(coef) < 0.01 ? d3.format('.0e')(coef) : d3.format('.2f')(coef),
            'group_value': (typeof reg2 === 'undefined') ? '' 
                : Math.abs(reg2.coef) < 0.01 ? d3.format('.0e')(reg2.coef) : d3.format('.2f')(reg2.coef)
        },
        {
            'property': 'p-value',
            'pop_value': pvalue < 0.01 ? d3.format('.0e')(pvalue) : d3.format('.2f')(pvalue),
            'group_value': (typeof reg2 === 'undefined') ? ''
                : (reg2.pvalue < 0.01 ? d3.format('.0e')(reg2.pvalue) : d3.format('.2f')(reg2.pvalue))
        },
        {
            'property': 'CI',
            'pop_value': '[' + (Math.abs(conf_int[0]) < 0.01 
                            ? d3.format('.0e')(conf_int[0]) 
                            : d3.format('.2f')(conf_int[0])) + 
                     ',' + (Math.abs(conf_int[1]) < 0.01
                            ? d3.format('.0e')(conf_int[1])
                            : d3.format('.2f')(conf_int[1])) + ']',
            'group_value': (typeof reg2 === 'undefined') ? ''
                : '[' + (Math.abs(reg2.conf_int[0]) < 0.01 
                        ? d3.format('.0e')(reg2.conf_int[0]) 
                        : d3.format('.2f')(reg2.conf_int[0])) + 
                    ',' + (Math.abs(reg2.conf_int[1]) < 0.01
                        ? d3.format('.0e')(reg2.conf_int[1])
                        : d3.format('.2f')(reg2.conf_int[1])) + ']'
        },
        {
            'property': '#sample',
            'pop_value': nobs,
            'group_value': (typeof reg2 === 'undefined') ? '' : reg2.nobs
        },
    ]
    return {
        'sp_flag': sp_flag,
        'data_for_table': result
    };
}

export function _calcMeanImbScore(imbScore, selectedGroupIndex, selectedZNames){
    let color = 'green', status = 'success', meanImbScore = '';
    if (imbScore.length > 0){
        let data = imbScore
              .filter(d => d['groupIndex'] === selectedGroupIndex)
              .filter(d => selectedZNames.includes(d['varName']));
        meanImbScore = d3.mean(data, d => d['score']);
        color = meanImbScore < 0.2 ? 'green' : 'orange';
        status = meanImbScore < 0.2 ? 'success' : 'processing';
        meanImbScore = d3.format('.2f')(meanImbScore);
    }
    return {
        'color': color,
        'status': status,
        'ImbScore': meanImbScore
    };
}

export function _calcMaxImbScore(imbScore, selectedGroupIndex, selectedZNames){
    let color = 'green', status = 'success', maxImbScore = '';
    if (imbScore.length > 0){
        let data = imbScore
              .filter(d => d['groupIndex'] === selectedGroupIndex)
              .filter(d => selectedZNames.includes(d['varName']));
        maxImbScore = d3.max(data, d => d['score']);
        color = maxImbScore < 0.2 ? 'green' : 'orange';
        status = maxImbScore < 0.2 ? 'success' : 'processing';
        maxImbScore = d3.format('.2f')(maxImbScore);
    }
    return {
        'color': color,
        'status': status,
        'ImbScore': maxImbScore
    };
}

export const PurpleSwitch = withStyles({
    switchBase: {
      color: purple[300],
      '&$checked': {
        color: purple[500],
      },
      '&$checked + $track': {
        backgroundColor: purple[500],
      },
    },
    checked: {},
    track: {},
  })(Switch);

  export const DefaultSwitch = withStyles({
    switchBase: {
      color: grey[300],
      '&$checked': {
        color: grey[500],
      },
      '&$checked + $track': {
        backgroundColor: grey[500],
      },
    },
    checked: {},
    track: {},
  })(Switch);