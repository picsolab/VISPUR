import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import styled from "styled-components";
import { Table } from 'antd';

import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import {default as SST} from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import Alert from '@material-ui/lab/Alert';

import LollipopVis from './LollipopVis';
import { _getDataSource, _calcMaxImbScore, PurpleSwitch, DefaultSwitch } from './util'
import { Title, SubTitle, useStyles, LabelTitle } from '../../util'

const LocalDiagnosisWrapper = styled.div.attrs({
  className: "local_diagnosis_wrapper",
})`
  grid-area: l;
  padding: 10px;
  // background-color: #f9f9f9;
  // border-right: 0.2px solid lightgray;
`;

const LocalDiagnosis = ({
  regressionResults,
  population,
  subgroups,
  selectedFeatures
}) => {

  const [state, setState] = React.useState({
    checkedA: true,
    checkedB: true,
  });

  const handleChange = (event) => {
    setState({ ...state, [event.target.name]: event.target.checked });
  };

  const classes = useStyles();

  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);

  if (typeof regressionResults === "undefined"){
    return (
      <LocalDiagnosisWrapper>
        <Title>DECISION DIAGNOSIS</Title>
      </LocalDiagnosisWrapper>
    )
  } else if (regressionResults['population'].length === 0){
    return (
      <LocalDiagnosisWrapper>
      <Title>DECISION DIAGNOSIS</Title>
      </LocalDiagnosisWrapper>
    )
  }
  
  const selectedZNames = !_.isEmpty(selectedFeatures['covariates']) 
                         ? selectedFeatures['covariates'].map(d => d['name']) 
                         : selectedFeatures['Z'].map(d => d['name']);
  const popImbScore = population['imbScores'],
        groupImbScore = subgroups['imbScores'];

  const popRegressionData = regressionResults['population'],
        groupRegressionData = regressionResults['subgroup'];

  // const groupIndices = [...new Set(subgroups.GroupIDList)];
  const groupIndices = groupRegressionData.map(d => d['groupIndex']);

  const handleChangeSelectedGroupIndex = (event) => {
    setSelectedGroupIndex(event.target.value);
  }

  const dataSource = _getDataSource(popRegressionData, groupRegressionData, selectedGroupIndex);
  const {sp_flag, data_for_table} = dataSource;

  const popBadgeInfos = _calcMaxImbScore(popImbScore, 'P', selectedZNames),
        groupBadgeInfos = _calcMaxImbScore(groupImbScore, selectedGroupIndex, selectedZNames);

  const columns = [
    {
      title: 'Property',
      dataIndex: 'property',
      key: 'property',
    },
    {
      title: 'Population',
      dataIndex: 'pop_value',
      key: 'pop_value',
    },
    {
      title: 'Subgroup',
      dataIndex: 'group_value',
      key: 'group_value',
    },
  ];

  if (_.isEmpty(selectedFeatures.cause) || _.isEmpty(selectedFeatures.outcome)){
    return (
      <LocalDiagnosisWrapper>
        <Title>DECISION DIAGNOSIS</Title>
      </LocalDiagnosisWrapper>
    );
  }
  
  return (
    <LocalDiagnosisWrapper>
      <Title>DECISION DIAGNOSIS</Title>
      <div id="LDTitleContainer">
        <div id="LDlefttitle"><SubTitle>{'Basic Statistics'}</SubTitle></div>
        <div id="LDrightselect">
        <FormControl className={classes.formControl}>
        <InputLabel id="demo-simple-select-disabled-label">Group</InputLabel>
          <SST
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={selectedGroupIndex}
            onChange={handleChangeSelectedGroupIndex}
          >
            {groupIndices
              .map((g, i) => 
              <MenuItem key={i} value={i}>
                {'GroupID ' + i}
              </MenuItem>)}
          </SST>
        </FormControl>
        </div>
      </div>

      {sp_flag === true 
        ? (<Alert severity="error">Simpson's Paradox!</Alert>) 
        : (
          sp_flag === false 
          ? <Alert severity="success">Associations are the same direction.</Alert>
          : <p/>
        )}
      <Table 
        dataSource={data_for_table}
        columns={columns}
        pagination={false}
      />
      <br></br>
      <SubTitle>{'Imbalance Chart'}</SubTitle>
      {(popBadgeInfos.ImbScore > 0.2)
        ? (<Alert severity='error'>
            Population: high imbalance!</Alert>)
        : (<Alert severity='success'>Population: low imbalance.</Alert>)}
      {(groupBadgeInfos.ImbScore > 0.2)
        ? (<Alert severity='error'>Subgroup: high imbalance!</Alert>)
        : (
          groupBadgeInfos.ImbScore === ''
          ? <b/>
          : <Alert severity='success'>Subgroup: low imbalance.</Alert>
        )}
      <br />
      <div align='right'>
        <FormControlLabel
          control={
            <DefaultSwitch 
            size="small"
            checked={state.checkedA}
            onChange={handleChange}
            name="checkedA" />
          }
            label={<LabelTitle>Population On</LabelTitle>}/>
        <FormControlLabel
          control={
            <PurpleSwitch 
              size="small"
              checked={state.checkedB} 
              onChange={handleChange} 
              name="checkedB" />}
          label={<LabelTitle>Subgroup On</LabelTitle>}
        />
      </div>

      <div class="IBContainer">
      <LollipopVis
        checkState={state}
        popImbScore={popImbScore}
        groupImbScore={groupImbScore}
        selectedGroupIndex={selectedGroupIndex} 
        selectedZNames={selectedZNames}
      /> </div>
      </LocalDiagnosisWrapper>
  );
}

export default LocalDiagnosis;