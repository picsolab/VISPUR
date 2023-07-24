import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import axios from 'axios';
import d3tooltip from 'd3-tooltip';
import styled from "styled-components";
import { Select as ANTSELECT, Button, Table, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

import {FormControl, Select, MenuItem, InputLabel } from '@material-ui/core';


import { _getZ, _getFeatureNames, _getFeatureObj, _getXYMode, _feasibilityInspect,
         _calcSummaryDataForStorytelling, _renderHistogram, 
         _calcForXYSpaceCircle, _calcForXYSpaceContinuous,
         _calcSummaryDataForCovariateSpace, _assignGroupIndex } from './util';
import '../../App.css';
import { Title, CaptionTitle, SubTitle, useStyles } from '../../util';
import PartitionControl from './PartitionControl';



const GeneratorWrapper = styled.div.attrs({
  className: "generator_wrapper",
})`
  grid-area: g;
  // height: 1050px;
  padding: 10px;
  background-color: #f9f9f9;
  border-right: 0.2px solid lightgray;
  border-left: 0.5px;
  border-bottom: 5px solid #756bb1;
`;

const VariableWrapper = styled.div.attrs({
	className: "variable_wrapper",
})`
	grid-area: p;
  // background: #efedf5;
  // padding: 10px;
  margin-top: 10px;
  // border-bottom: 0.2px solid lightgray;
`;


const tooltip = d3tooltip(d3);

const Generator = ({
  data,
  features,
  subgroups,
  selectedFeatures,
  setSelectedFeatures,
  setPopulation,
  setSubgroups,
  setRegressionResults,
  setSummaryDataForST,
  setSummaryDataForXY,
  setSummaryDataForCS,
  setDiscScores,
  setGNames
}) => {
  const classes = useStyles();

  const [manualBreaks, setManualBreaks] = useState([]);
  const [numSubgroups, setNumSubgroups] = useState(1);
  const [minSamples, setMinSamples] = useState(-1);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const featureListForCauseVar = features.filter(d => d.name !== selectedFeatures.outcome.name),
    featureListForOutcomeVar = features.filter(d => d.name !== selectedFeatures.cause.name),
    featureListForZ = _getZ(selectedFeatures.cause, selectedFeatures.outcome, features);

  const refs = featureListForZ.map(
      (ref, i) => ref = React.createRef()
    );
  
  // compute population-level data
  const handleChangeSelectedVar = (type, feature, featureInfos) => {
    let causeVar, outcomeVar;
    if (type === 'covariates') {
      setSelectedFeatures((prevState) => ({
        ...prevState,
        covariates: features.filter(f => _.includes(feature, f.name)) // here, feature is selectedCovariate"s"
      }));
      setSelectedRowKeys(prevState => featureInfos.map(d => parseInt(d.key)));
    } else {
      let zVars;
      if (type === 'cause') {
        causeVar = feature;
        outcomeVar = selectedFeatures.outcome;
        zVars = _getZ(causeVar, outcomeVar, features);
        setSelectedFeatures((prevState) => ({
          ...prevState,
          cause: causeVar,
          Z: zVars
        }));
      } else {
        causeVar = selectedFeatures.cause;
        outcomeVar = feature;
        zVars = _getZ(causeVar, outcomeVar, features);
        setSelectedFeatures((prevState) => ({
          ...prevState,
          outcome: outcomeVar,
          Z: zVars
        }));
      }

      if (!_.isEmpty(causeVar) && !_.isEmpty(outcomeVar)) {
        fetchImbScore({
          mode: 'population',
          x: causeVar.name,
          y: outcomeVar.name,
          Z: _getFeatureNames(_getZ(
            causeVar,
            outcomeVar,
            features
          )),
          groupIDs: [],
          feasibleGroupIndices: []
        });

        const summaryDataForCS = _calcSummaryDataForCovariateSpace([], data, zVars);
        setSummaryDataForCS((prevState) => ({
          ...prevState,
          population: summaryDataForCS
        }));

        fetchRegressionInfo({
          causeVarName: causeVar['name'],
          outcomeVarName: outcomeVar['name'],
          outcomeVarType: outcomeVar['type'],
          GroupIDList: [],
          feasibleGroupIndices: []
        });
        
        const summaryDataForST = _calcSummaryDataForStorytelling(
          [], data, 
          causeVar['name'], 
          outcomeVar['name'], 
          causeVar['type']
        );
        setSummaryDataForST((prevState) => ({
          ...prevState,
          population: summaryDataForST
        }));

        const mode = _getXYMode(causeVar['type'], outcomeVar['type']);
        // console.log('==== mode: ', mode, 'causeVar: ', causeVar, 'outcomeVar: ', outcomeVar);
        if (mode === 'Circle') {
          const summaryDataForXY = _calcForXYSpaceCircle(
            [], data, causeVar, outcomeVar);
          setSummaryDataForXY((prevState) => ({
            ...prevState,
            population: summaryDataForXY
          }));
        }
        if (mode === 'Ellipse') {
          fetchEllipse({
            'causeVarName': causeVar['name'],
            'outcomeVarName': outcomeVar['name'],
            'GroupIDList': []
          });
        }
      }
    }
  }

  const fetchEllipse = async({
    causeVarName, 
    outcomeVarName, 
    GroupIDList}) => {
    await axios({
      method: 'post',
      url: 'dataset/calEllipseParams/',
      data: JSON.stringify({
        'causeVarName': causeVarName,
        'outcomeVarName': outcomeVarName,
        'GroupIDList': GroupIDList
      })
    }).then(res => {
      const ellipseParams = res.data.ellipseParams;
      const summaryDataForXY = _calcForXYSpaceContinuous(
        GroupIDList, data, ellipseParams);
      
      if (GroupIDList.length === 0){
        setSummaryDataForXY((prevState) => ({
          ...prevState,
          population: summaryDataForXY
        }));
      } else {
        setSummaryDataForXY((prevState) => ({
          ...prevState,
          subgroup: summaryDataForXY
        }));
      }
    })
  };

  const fetchRegressionInfo = async ({
      causeVarName, 
      outcomeVarName, outcomeVarType, 
      GroupIDList, feasibleGroupIndices}) => {
    await axios({
      method: 'post',
      url: 'dataset/calRegression/',
      data: JSON.stringify({
        'causeVarName': causeVarName,
        'outcomeVarName': outcomeVarName,
        'outcomeVarType': outcomeVarType,
        'GroupIDList': GroupIDList,
        'feasibleGroupIndices': feasibleGroupIndices
      })
    }).then(res => {

      if (GroupIDList.length === 0) {
        setRegressionResults(prevState => ({
          ...prevState,
          population: res.data
        }));

      } else {
        setRegressionResults(prevState => ({
          ...prevState,
          subgroup: res.data
        }));
      }
    });
  };

  const fetchDiscScores = async({ causeVarName, outcomeVarName, GroupIDList }) => {
    await axios({
      method: 'post',
      url: 'dataset/calDiscByRegression/',
      data: JSON.stringify({
        causeVarName: causeVarName,
        outcomeVarName: outcomeVarName,
        GroupIDList: GroupIDList
      })
    }).then(res => {
      // console.log('===disc score:', res.data);
      setDiscScores(res.data);
    });
  };

  const fetchImbScore = async ({ 
    mode, x, y, Z, groupIDs = [],
    feasibleGroupIndices = []
  }) => {
    await axios({
      method: 'post',
      url: 'dataset/calImbalanceScore/',
      data: JSON.stringify({
        x: x,
        y: y,
        Z: Z,
        groupIDs: groupIDs,
        feasibleGroupIndices: feasibleGroupIndices
      })
    }).then(res => {
      if (mode == 'population') {
        const popImbScores = res.data;

        setPopulation(prevState => ({
          ...prevState,
          imbScores: popImbScores
        }));

        setSelectedFeatures(prevState => ({
          ...prevState,
          Z: prevState.Z.map((z, i) => ({
            ...z,
            score: Math.ceil(popImbScores[i]['score'] * 100) / 100
          }))
        }));
      } else if (mode == 'subgroup') {
        // console.log('====grpImbScore:', res.data);
        setSubgroups({
          GroupIDList: groupIDs,
          imbScores: res.data
        });
      }
    })
  };

  function handlePartition(GroupIDList){

      setSubgroups(prevState => ({
        ...prevState,
        GroupIDList: GroupIDList
      }));

      // feasibility insepection here!!!!
      const feasibleGroupIndices = _feasibilityInspect(
        data, GroupIDList, 
        selectedFeatures['cause']['name'], 
        selectedFeatures['cause']['type']);
      // console.log('====feasibleGroupIndices:', feasibleGroupIndices);

      // only call this function if there are more than 1 subgroups
      if ([...new Set(GroupIDList)].length > 1){
        fetchDiscScores({
          causeVarName: selectedFeatures.cause.name,
          outcomeVarName: selectedFeatures.outcome.name,
          GroupIDList: GroupIDList
        });
      }

      fetchImbScore({
        mode: 'subgroup',
        x: selectedFeatures.cause.name,
        y: selectedFeatures.outcome.name,
        Z: _getFeatureNames(selectedFeatures.Z),
        groupIDs: GroupIDList,
        feasibleGroupIndices: feasibleGroupIndices
      });

      fetchRegressionInfo({
        causeVarName: selectedFeatures['cause']['name'],
        outcomeVarName: selectedFeatures['outcome']['name'],
        outcomeVarType: selectedFeatures['outcome']['type'],
        GroupIDList: GroupIDList,
        feasibleGroupIndices: feasibleGroupIndices
      });

      const summaryDataForCS = _calcSummaryDataForCovariateSpace(
        GroupIDList, data, selectedFeatures['Z']);

      setSummaryDataForCS((prevState) => ({
        ...prevState,
        subgroup: summaryDataForCS
      }));

      const summaryDataForST = _calcSummaryDataForStorytelling(
        GroupIDList,
        data, 
        selectedFeatures['cause']['name'], 
        selectedFeatures['outcome']['name'], 
        selectedFeatures['cause']['type']
      );
      setSummaryDataForST((prevState) => ({
        ...prevState,
        subgroup: summaryDataForST
      }));

      const mode = _getXYMode(
        selectedFeatures['cause']['type'], 
        selectedFeatures['outcome']['type']);
      if (mode === 'Circle') {
        const summaryDataForXY = _calcForXYSpaceCircle(
          GroupIDList, data, selectedFeatures['cause'], 
          selectedFeatures['outcome']);
        // console.log('====summaryDataForXY:', summaryDataForXY);
        setSummaryDataForXY((prevState) => ({
          ...prevState,
          subgroup: summaryDataForXY
        }));
      }
      if (mode === 'Ellipse') {
        fetchEllipse({
          'causeVarName': selectedFeatures['cause']['name'],
          'outcomeVarName': selectedFeatures['outcome']['name'],
          'GroupIDList': GroupIDList
        });
      };
  }

  const fetchAutoPartition = async({ ngroups, minSamples }) => {
    await axios({
      method: 'post',
      url: 'dataset/autoPartition/',
      data: JSON.stringify({
        causeVarName: selectedFeatures.cause.name,
        causeVarType: selectedFeatures.cause.type,
        covariates: selectedFeatures.covariates.map(d => d.name),
        ngroups: ngroups,
        minSamples: minSamples
      })
    }).then(res => {
      const GroupIDList = res.data.groupIDList, 
            gNames = res.data.gNames;
      setGNames(gNames);
      handlePartition(GroupIDList);
    });
  };

  const onSubmitButtonClick = (e) => {

    if (manualBreaks.length > 0){
      const {gIndex, gNames} = _assignGroupIndex(data, manualBreaks);
      setGNames(gNames);
      handlePartition(gIndex);
    } else if (numSubgroups > 1) {
      fetchAutoPartition({
        ngroups: numSubgroups,
        minSamples: minSamples
      });
    }
  }

  useEffect(() => {
    // Render histograms of Z|X for each Z
    if (!_.isEmpty(selectedFeatures.cause)){
      const x = features.filter(d => d.name == selectedFeatures.cause.name)[0];
      _.orderBy(selectedFeatures.Z, ['score'], ['desc']).forEach((z, i) => {
        d3.select(refs[i].current).selectAll('*').remove();
        _renderHistogram(z, x, i, data, refs);
      });
      // selectedFeatures.Z.forEach((z, i) => {
      //   d3.select(refs[i].current).selectAll('*').remove();
      //   _renderHistogram(z, x, i, data, refs);
      // });
    } else if ((!_.isEmpty(selectedFeatures.cause)) && !_.isEmpty(selectedFeatures.outcome)) {
        /*
        1. Update imbalance score for subgroups
        2. Store scores into subgroups variable
        3. Send back to App.js
          3-1. selectedFeatures
          3-2. subgroups
          3-3. population
        4. Set XYSpace mode 
      */

      const l = data.length;
      const numGroups = 4;
      // const subgroups = d3.range(0, numGroups).map(gIdx => ({
      //   id: gIdx,
      //   data: [],
      //   imbScores: {}
      // }));
      var GroupIDList = [];
      for (var i=0; i<l; i++){
        GroupIDList.push(_.random(0, numGroups-1));
      }

      

      /* 3-1. */
      // setSubgroups(subgroups.map(g => ({ /* 2 & 3-2. */
      //   ...g,
      //   // data: data.filter((d, i) => GroupIDList[i] === g['id']),
      //   imbScores: subgroupImbScores.filter(d => d['group'] === g['id'])[0]['values']
      // })));
    }
  }, [selectedFeatures, features, refs.current]);
  
  const { Option } = Select;

  const columns = [
    { title: 'Covariate', dataIndex: 'featureName' },
    { title: 'CF Score', dataIndex: 'score' },
    { title: 'Distribution', dataIndex: 'distribution', 
        render: (a, b, i) => (
          <div>
            <svg 
              ref={refs[i]} 
              width={80} 
              height={40}>
            </svg>
          </div>
        ) 
    },
  ];

  // Sort and list Z variables
  const dataZVarTable = _.orderBy(selectedFeatures.Z, ['score'], ['desc']).map((d, i) => ({
    key: i,
    featureName: d.name,
    score: d.score,
    distribution: '',
  }));
    
  const rowZVars = {
    selectedRowKeys,
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedFeatures((prevState) => {
        const selectedCovariateNames = selectedRows.map(d => d.featureName);
        return {
        ...prevState,
        covariates: features.filter(f => _.includes(selectedCovariateNames, f.name))
      }});

      setSelectedRowKeys(selectedRowKeys);
    },
    getCheckboxProps: record => ({
      // disabled: record.name === 'Disabled User', // Column configuration not to be checked
      name: record,
    }),
  };
  
  return (
    <GeneratorWrapper>
        {/* <Title>GENERATOR</Title> */}
        <Title>CONFOUNDER DASHBOARD</Title>
      <VariableWrapper>
        {/* Cause/Outcome */}
        <div>
        <FormControl className={classes.formControl}>
          <InputLabel>Cause</InputLabel>
            <Select
              value={_.isEmpty(selectedFeatures.cause) 
                      ? selectedFeatures.cause 
                      : selectedFeatures.cause.name}
              onChange={(event) => 
                handleChangeSelectedVar(
                  'cause', 
                  _getFeatureObj(event.target.value, features),
                  []
                )}
            >
              {featureListForCauseVar
                .map((f, i) => 
                <MenuItem key={i} value={f.name}>
                  {f.name}
                </MenuItem>)}
            </Select>
          </FormControl>

          <FormControl className={classes.formControl}>
          <InputLabel>Outcome</InputLabel>
            <Select
              value={_.isEmpty(selectedFeatures.outcome) 
                      ? selectedFeatures.outcome 
                      : selectedFeatures.outcome.name}
              onChange={(event) => 
                handleChangeSelectedVar(
                  'outcome', 
                  _getFeatureObj(event.target.value, features),
                  []
                )}
            >
              {featureListForOutcomeVar
                .map((f, i) => 
                <MenuItem key={i} value={f.name}>
                  {f.name}
                </MenuItem>)}
            </Select>
          </FormControl>
        </div>
        {/* Confounders */}
        <CaptionTitle>
          Confounders
          <Tooltip
          title="A confounding variable is a third variable that influences both the cause and outcome variables."
          placement="topLeft"
          >
            <QuestionCircleOutlined 
              style={{ margin: '3px'}} />
          </Tooltip>
        </CaptionTitle>
        <div>
        <ANTSELECT 
          style={{width: '100%'}}
          size={"default"}
          mode="multiple"
          maxTagCount="responsive"
          value={_getFeatureNames(selectedFeatures.covariates)}
          onChange={(selectedCovariateNames, selectedCovariateInfos) => 
              handleChangeSelectedVar(
                'covariates', 
                selectedCovariateNames, 
                selectedCovariateInfos)
          }>
          {featureListForZ.map((f, i) => 
            <Option key={i} value={f.name}>
              {f.name}
            </Option>)
          }
        </ANTSELECT>
        </div>
        <br/>
        <Table 
          style={{ height: 350, overflowY: 'scroll', marginTop: 5 }}
          // style={{ height: 450, overflowY: 'scroll', marginTop: 5 }} // temporary
          rowSelection={rowZVars} 
          columns={columns} 
          dataSource={dataZVarTable} 
          pagination={false} 
        />
      </VariableWrapper>
      <br />
      <PartitionControl 
        data={data}
        covariates={selectedFeatures.covariates}
        manualBreaks={manualBreaks}
        numSubgroups={numSubgroups}
        minSamples={minSamples}
        setManualBreaks={setManualBreaks}
        setNumSubgroups={setNumSubgroups}
        setMinSamples={setMinSamples}
      />
      <div align='right'>
      <Button
        type='primary'
        shape="round"
        onClick={onSubmitButtonClick}
      >
        Submit
      </Button>
      </div>
    </GeneratorWrapper>
  );
}

export default Generator;