import React, { useState } from "react";
import styled from "styled-components";
import { Select as ANTSELECT} from 'antd';
import PropTypes from "prop-types";

import {
	Button, Table,
	TableBody, TableCell, TableHead, TableRow,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Tooltip, FormControl, Select, MenuItem, InputLabel,
  Paper, Box, Typography, Tab, Tabs,
} from "@material-ui/core";
import AddToPhotosIcon from '@material-ui/icons/AddToPhotos';
import DeleteIcon from '@material-ui/icons/Delete';

import { SubTitle, useStyles, Title } from "../../util";
import PartitionSlider from './PartitionSlider';



const PartitionControlWrapper = styled.div.attrs({
	className: "partition_control_wrapper",
})`
	grid-area: p;
  // background: whitesmoke;
  // padding: 10px;
  margin-top: 10px;
`;

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`
  };
}

const PartitionControl = ({
  data,
  covariates,
  manualBreaks,
  numSubgroups,
  minSamples,
  setManualBreaks,
  setNumSubgroups,
  setMinSamples
}) => {
  const { Option } = ANTSELECT;

	const classes = useStyles();

  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  
  const [covariatesForPartition, setCovariatesForPartition] = useState([]);
	const [showConfirm, setShowConfirm] = React.useState(false);

	// Function For adding new row object
	const handleAdd = () => {
		setManualBreaks([
			...manualBreaks,
			{
				id: manualBreaks.length + 1,
        breaks: "",
        covariate: "",
        infos: {}
			},
		]);
	};

	const handleInputChange = (varName, rowIndex) => {
		const list = [...manualBreaks];
		list[rowIndex]['covariate'] = varName;
    list[rowIndex]['infos'] = covariates.filter(d => d.name === varName)[0];
		setManualBreaks(list);
    setCovariatesForPartition(
      list.map(d => d['covariate']));
	};

	const handleRemoveClick = (i) => {
		const list = [...manualBreaks];
		list.splice(i, 1);
		setManualBreaks(list);
		setShowConfirm(false);
    setCovariatesForPartition(
      list.map(d => d['covariate']));
	};

	// Showing delete confirmation to users
	const handleConfirm = () => {
		setShowConfirm(true);
	};

	// Handle the case of delete confirmation
	// where user click no
	const handleNo = () => {
		setShowConfirm(false);
	};

	const handleSelectNumSubgroups = (event) => {
    setNumSubgroups(event.target.value);
  }

  const handleSelectMinSamples = (event) => {
    setMinSamples(event.target.value);
  }

  return (
    <PartitionControlWrapper>
      {/* <SubTitle>Subgroup Generation</SubTitle> */}
      <Title>SUBGROUP PARTITION</Title>
      <div>
      <Paper className={classes.root}>
        <Tabs
          value={value}
          onChange={handleChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="Manual" {...a11yProps(0)} />
          <Tab label="Auto" {...a11yProps(1)} />
        </Tabs>
      </Paper>
      <TabPanel value={value} index={0}>
        <div class="MPContainer">
        <Table
          className={classes.table}
          size="small"
          aria-label="a dense table">
        <TableHead>
          <TableRow>
          <TableCell align="left">Variable</TableCell>
          <TableCell align='center'>Cutpoints</TableCell>
          <TableCell align="right">{
            <Tooltip title="Click to add an additional variable">
              <AddToPhotosIcon 
              fontSize="small" 
              onClick={handleAdd} />
            </Tooltip>
            }
          </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
        {manualBreaks.map((row, i) => {
          return (
            <TableRow>
              <TableCell padding="none">
                <ANTSELECT
                  style={{ width: "90px" }}
                  placeholder=""
                  bordered={false}
                  onChange={(varName) => handleInputChange(varName, i)}
                >
                  {covariates
                    .filter(f => !covariatesForPartition.includes(f.name))
                    .map((f, j) => 
                      <Option key={j} value={f.name}>
                        {f.name}
                      </Option>)
                  }
                </ANTSELECT>
              </TableCell>
              <TableCell padding="none">
                {/* check first if the covariate was selected from the dropdown menu */}
                {row.covariate != '' ? (<PartitionSlider 
                  data={data}
                  rowIndex={i}
                  row={row}
                  setManualBreaks={setManualBreaks}
                />) : <div></div>}
              </TableCell>
              <TableCell 
                align="right" 
                size="small">
                <Tooltip title="Click to delete the variable">
                  <DeleteIcon 
                      style={{flex: 1}}
                      fontSize='small' 
                      onClick={handleConfirm} />
                </Tooltip>
              </TableCell>
              {showConfirm && (
              <div>
                <Dialog
                open={showConfirm}
                onClose={handleNo}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                >
                <DialogTitle id="alert-dialog-title">
                  {"Confirm Delete"}
                </DialogTitle>
                <DialogContent>
                  <DialogContentText id="alert-dialog-description">
                  Are you sure to delete
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={() => handleRemoveClick(i)}
                    color="primary"
                    autoFocus
                  >
                  Yes
                  </Button>
                  <Button
                    onClick={handleNo}
                    color="primary"
                    autoFocus
                  >
                  No
                  </Button>
                </DialogActions>
                </Dialog>
              </div>
              )}
            </TableRow>
          );
          })}
        </TableBody>
        </Table>    
        </div>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <div>
          <FormControl className={classes.formControl}>
          <InputLabel>#Subgroups</InputLabel>
            <Select
              value={numSubgroups}
              onChange={handleSelectNumSubgroups}
            >
              {[2,3,4,5,6,7,8]
                .map(i => 
                <MenuItem key={i} value={i}>
                  {i}
                </MenuItem>)}
            </Select>
          </FormControl>
          <FormControl className={classes.formControl}>
          <InputLabel> Min #Samples </InputLabel>
            <Select
              value={minSamples}
              onChange={handleSelectMinSamples}
            >
              {[2,3,4,5,6,7,8]
                .map(i => 
                <MenuItem key={i} value={i}>
                  {i}
                </MenuItem>)}
            </Select>
          </FormControl>
        </div>
      </TabPanel>
    </div>
    </PartitionControlWrapper>
  );
}

export default PartitionControl;
