import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import styled from "styled-components";

import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Tooltip from '@material-ui/core/Tooltip';
import AddIcon from '@material-ui/icons/Add';
import Box from '@material-ui/core/Box';

import StoryTellingVis from './StoryTellingVis';
import '../../App.css';
import { Title, useStyles } from '../../util';


const StoryTellingWrapper = styled.div.attrs({
  className: "story_telling_wrapper",
})`
  grid-area: st;
  padding: 10px;
  border-top: 0.2px solid lightgray;
  border-bottom: 5px solid #756bb1;
`;

const defaultProps = {
  bgcolor: 'background.paper',
  m: 1,
  border: 0.2,
  borderRadius: 5,
  style: { width: '8rem', height: '8rem' },
};


const StoryTelling = ({
  data,
  subgroups,
  selectedFeatures,
  summaryDataForST
}) => {

  const classes = useStyles();

  const groupIndices = [...new Set(subgroups.GroupIDList)];
  const n_groups = groupIndices.length;

  const outcomeVar = selectedFeatures['outcome'];
  const popSummaryData = summaryDataForST['population'],
        groupSummaryData = summaryDataForST['subgroup'];
  
  const [selectedGroupIndex, setSelectedGroupIndex] = useState({'g1': 0, 'g2': 0});

  const [groupSelected, setGroupSelected] = useState([0, 0]);
  const handleAddClick = () => {
    if (groupSelected.length < n_groups){
      setGroupSelected([
        ...groupSelected, 0
      ]);
    }
	};

  

  const handleChangeSelectedGroupIndex = (i, event) => {
    const list = [...groupSelected];
    list[i] = event.target.value;
    setGroupSelected(list);
  }

  if (_.isEmpty(selectedFeatures.cause) || _.isEmpty(selectedFeatures.outcome)) {
    return (
      <StoryTellingWrapper>
        <Title>REASONING STORYBOARD</Title>
      </StoryTellingWrapper>
    );
  }
    

  return (
    <StoryTellingWrapper>
      <Title>REASONING STORYBOARD</Title>
      <div class="STContainer">
      <Grid container spacing={1}>
        <Grid item xs={3}>
          <div align='center'>
          <FormControl className={classes.formControl} disabled>
          <InputLabel id="demo-simple-select-disabled-label">Population</InputLabel>
            <Select>
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
            </Select>
          </FormControl>
          </div>
          <StoryTellingVis 
              groupIndex={'P'}
              data={data}
              summaryData={popSummaryData}
              outcomeVar={outcomeVar}
          />
        </Grid>
        {groupSelected.map((row, j) => {
          return (
            <Grid item xs={3}>
              <div align='center'>
                <FormControl className={classes.formControl}>
                <InputLabel id="demo-simple-select-disabled-label">Group</InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={groupSelected[j]}
                    onChange={(event) => 
                      handleChangeSelectedGroupIndex(j, event)} >
                    {groupIndices
                      .map((g, i) => 
                      <MenuItem key={i} value={i}>
                        {'GroupID ' + i}
                      </MenuItem>)}
                  </Select>
                </FormControl>
              </div>
              <StoryTellingVis 
                groupIndex={groupSelected[j]}
                data={data}
                summaryData={groupSummaryData}
                outcomeVar={outcomeVar}
            />
            </Grid> 
          );
        })}
        <Grid item xs={3}>
          {/* Add new  */}
          <div align="center">
            <Tooltip title="Add an additional group">
            <Box borderColor="lightgray" {...defaultProps}>
            <AddIcon style={{ fontSize: 100 }} 
              color="primary" 
              className={classes.icon} 
              onClick={handleAddClick} />
            </Box>
            </Tooltip>
          </div>
        </Grid>
      </Grid>
      </div>
    </StoryTellingWrapper>
  );
}

export default StoryTelling;
