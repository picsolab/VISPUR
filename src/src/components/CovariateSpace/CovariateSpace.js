import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import styled from "styled-components";

import { Row, Col } from 'antd';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';
import { useTheme } from '@material-ui/core/styles';


import '../../App.css';
import SpiderChartVis from './spiderChart'
import {getMaxMinValue} from './util'
import {SubTitle, Title, SmallTitle, useStyles} from '../../util'

const CovariateSpaceWrapper = styled.div.attrs({
  className: "covariate_space_wrapper",
})`
  grid-area: c;
  padding: 10px;
  // background-color: #f9f9f9;
  // border-bottom: 0.2px solid lightgray;
  border-right: 0.2px solid lightgray;
`;

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function getStyles(name, radarName, theme) {
  return {
    fontWeight:
      radarName.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

const CovariateSpace = ({
  features,
  summaryDataForCS,
  selectedFeatures,
  discScores,
  selectedSubgroups,
  setSelectedSubgroups,
  gNames
}) => {

  // console.log('===summaryDataForCS:', summaryDataForCS);

  const classes = useStyles();
  const theme = useTheme();
  const [radarName, setRadarName] = React.useState([]);
  const handleChange = (event) => {
    setRadarName(event.target.value);
  };


  const { Z, covariates} = selectedFeatures; // Z is all rest, covariates are selected confounders
  const maxNumAxis = 5;
  let selectedZNames = (radarName.length > 0 
      ? Z.filter(d => radarName.includes(d['name']))
      : Z).map(
        function(d){
            if (d.type === 'continuous'){
              return d.name;
            } else {
              const { label } = d;
              return label.slice(0, label.length - 1).map(l => d.name + '_' + l);
            }
        })
        .flat();
  

  selectedZNames = discScores.length === 0
    ? selectedZNames.slice(0, maxNumAxis) // if too many axes, just cut off at maxNumAxis;
    : discScores.filter(d => selectedZNames.includes(d['varName']))
                .sort((a, b) => { return b['disc'] - a['disc'] })
                .map(d => d['varName'])
                .slice(0, maxNumAxis); // rank based on disc and cut off at maxNumAxis;

  const popSummaryData = summaryDataForCS['population'],
        groupSummaryData = summaryDataForCS['subgroup'];

  const popRadarChartValues = popSummaryData.filter(
      d => selectedZNames.includes(d['axis']));
  const groupRadarChartValues = groupSummaryData.filter(
      d => selectedZNames.includes(d['axis']));
  const groups = [...new Set(
    groupRadarChartValues.map(d => d['groupIndex']))];
  
  const maxminValue = getMaxMinValue(features);
  
  if (_.isEmpty(selectedFeatures.cause) || _.isEmpty(selectedFeatures.outcome)){
    return (
      <CovariateSpaceWrapper>
        {/* <Title>GROUP PANEL</Title> */}
        <Title>SUBGROUP VIEWER</Title>
      </CovariateSpaceWrapper>
    )
  }

  return (
    <CovariateSpaceWrapper>
      {/* <Title>GROUP PANEL</Title> */}
      <Title>SUBGROUP VIEWER</Title>
      <div id="CSTitleContainer">
        <div id="CSlefttitle"><SubTitle>Covariate Space</SubTitle></div>
        <div id="CSrightselect">
          <FormControl className={classes.formControl}>
            <InputLabel id="demo-mutiple-name-label">Choose Axes</InputLabel>
            <Select
              labelId="demo-mutiple-name-label"
              id="demo-mutiple-name"
              multiple
              value={radarName}
              onChange={handleChange}
              input={<Input />}
              MenuProps={MenuProps}
            >
              {Z.map((item, i) => (
                <MenuItem key={i} value={item.name} style={getStyles(item.name, radarName, theme)}>
                  {item.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
      {/* <HelpOutlineIcon fontSize="small" /> */}
      </div>
      </div>
      <div class="CSContainer">
      <Row gutter={16}>
        <Col span={7}>
        <SmallTitle> Population </SmallTitle>
        {/* <Card size='small' type='inner'> population </Card> */}
          <SpiderChartVis
              data={popRadarChartValues}
              maxminValue={maxminValue}
              selectedSubgroups={selectedSubgroups}
              setSelectedSubgroups={setSelectedSubgroups}
              groupIndex={'P'}
              ngroups={1}
              gNames={gNames}
          />
        </Col>
        {groups.map((g, i) => {
          return (
           <Col span={6}>
            <SmallTitle> {'GroupID ' + i} </SmallTitle>
            <SpiderChartVis
              data={groupRadarChartValues}
              maxminValue={maxminValue}
              selectedSubgroups={selectedSubgroups}
              setSelectedSubgroups={setSelectedSubgroups}
              groupIndex={i}
              ngroups={groups.length}
              gNames={gNames}
            />
          </Col>
        )})}
      </Row>
      </div>
    </CovariateSpaceWrapper>
  );
}

export default CovariateSpace;