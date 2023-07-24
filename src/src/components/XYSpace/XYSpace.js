import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import styled from "styled-components";
import 'antd/dist/antd.css';

import EllipseVis from  './EllipseVis';
import CircleVis from './CircleVis';
import { _getXYMode, _renderXYSpaceCircle, _renderXYSpaceEllipse } from './util';
import { SubTitle } from '../../util';

const XYSpaceWrapper = styled.div.attrs({
  className: "xy_space_wrapper",
})`
  grid-area: xy;
  padding: 10px;
  border-right: 0.2px solid lightgray;
`

const XYSpace = ({
  data,
  subgroups,
  selectedFeatures,
  summaryDataForXY,
  regressionResults,
  selectedSubgroups,
  setSelectedSubgroups,
  gNames
}) => {

  const causeVar = selectedFeatures['cause'], 
        outcomeVar = selectedFeatures['outcome'];
  const mode = _getXYMode(causeVar['type'], outcomeVar['type']);

  const GroupIDList = subgroups['GroupIDList'];

  if (_.isEmpty(selectedFeatures.cause) || _.isEmpty(selectedFeatures.outcome)){
    return (
      <XYSpaceWrapper></XYSpaceWrapper>
    )
  }

  if (mode === 'Circle'){
    return (
      <XYSpaceWrapper>
        <div style={{ display: 'flex'}}>
          <div style={{flex:1}} align="left">
            {/* <SubTitle>Cause-Effect Relationship</SubTitle> */}
            <SubTitle>Causality Space</SubTitle>
          </div>
        </div>
        <div class="XYContainer">
        <CircleVis
          data={data}
          summaryData={summaryDataForXY}
          regressionData={regressionResults}
          causeVar={causeVar}
          outcomeVar={outcomeVar}
          selectedSubgroups={selectedSubgroups}
          setSelectedSubgroups={setSelectedSubgroups}
          gNames={gNames}
        />
        </div>
      </XYSpaceWrapper>
    );
  } else {
    return (
      <XYSpaceWrapper>
        <div style={{ display: 'flex'}}>
        <div style={{flex:1}} align="left">
          {/* <SubTitle>Cause-Effect Relationship</SubTitle> */}
          <SubTitle>Causality Space</SubTitle>
        </div>
        </div>
        <div class="XYContainer">
          <EllipseVis
            GroupIDList={GroupIDList}
            data={data}
            summaryData={summaryDataForXY}
            regressionData={regressionResults}
            causeVarName={causeVar['name']}
            outcomeVarName={outcomeVar['name']}
            selectedSubgroups={selectedSubgroups}
            setSelectedSubgroups={setSelectedSubgroups}
            gNames={gNames}
          />
        </div>
      </XYSpaceWrapper>
    );
  }

  
}

export default XYSpace;