import React, { useEffect, useState, useRef } from "react";
import Grid from "@material-ui/core/Grid";
import Tooltip from '@material-ui/core/Tooltip';
import Typography from "@material-ui/core/Typography";
import { Slider, Rail, Handles, Tracks, Ticks } from "react-compound-slider";
import AddBoxIcon from '@material-ui/icons/AddBox';
import IndeterminateCheckBoxIcon from '@material-ui/icons/IndeterminateCheckBox';
import { MuiRail, TooltipRail, MuiHandle, MuiTrack, MuiTick } from "./PartitionSliderComponent";
import { _getBinSize, generate_array } from './util'
import { sliderLayout } from "../../layout";
import _ from 'lodash';
import * as d3 from 'd3';

const PartitionSlider = ({
	data,
	row,
	rowIndex,
	setManualBreaks
}) => {
	const rowInfos = row.infos;
	// console.log('rowInfos	: ', row, rowIndex, rowInfos);

	let tickCounts = rowInfos['type'] === 'continuous' ? 5 : 1;

	const [ domain, setDomain ] = useState([]);
	const [ values, setValues ] = useState([]);
	const [ update, setUpdate ] = useState([]);

	const ref = useRef(null)

	useEffect(() => {
		const svg = d3.select(ref.current);
		svg.selectAll('*').remove();

		let range, min, max, thresholds;
		const featureName = rowInfos['name'],
			featureValues = data.map(d => parseInt(d[featureName]));

		if (rowInfos['type'] === 'continuous'){
			range = rowInfos['range'];
			min = Math.floor(range[0]);
			max = Math.ceil(range[1]);
			range = [min, max];
			thresholds = d3.range(min, max, 1);
			
			setDomain([...range]);
			setValues([...range]);
			setUpdate([...range]);
			setManualBreaks(prevManualBreaks => {
				let updatedManualBreaks = [...prevManualBreaks];
				updatedManualBreaks[rowIndex]['breaks'] = range;
				return updatedManualBreaks;
			});
		} else { // for categorical
			min = parseInt(rowInfos['label'][0]);
			max = parseInt(rowInfos['label'][rowInfos['label'].length - 1]);
			range = [min, max];
			thresholds = d3.range(min, max + 1, 1);

			setDomain([...range]);
			setValues([0.5]);
			setUpdate([0.5]);
			setManualBreaks(prevManualBreaks => {
				let updatedManualBreaks = [...prevManualBreaks];
				updatedManualBreaks[rowIndex]['breaks'] = [0.5];
				return updatedManualBreaks;
			});
		}

		console.log('render histogram for (name, thresholds, values): ', 
				featureName, thresholds, featureValues)

		const dataBin = d3
			.histogram()
			.domain(range)
			.thresholds(thresholds)(featureValues);

		console.log('dataBin; ', dataBin);

		const xScale = d3
			.scaleBand()
			.domain(dataBin.map(d => d.x0))
			.range([0, sliderLayout.histXwidth]),
			yScale = d3
			.scaleLinear()
			.domain([0, d3.max(dataBin.map(d => d.length)) == 0 
							? 1 : d3.max(dataBin.map(d => d.length)) / featureValues.length])
			.range([sliderLayout.histYheight, 0]);
	
		const dataHistogram = svg
				.selectAll('.g_hist_partition_' + featureName)
				.data(dataBin);

		// dataHistogram.exit().remove();
		
		// add histograms
		dataHistogram
				.enter()
				.append('g')
				.attr('class', 'g_hist_partition_' + featureName + ' g_hist_partition_allfeatures')
				.attr('transform', d => 'translate(' + xScale(d.x0)+ ',' + 
										yScale(d.length / data.length) + ')')
				.append('rect')
				.attr('class', 'rect_hist_' + featureName)
				.attr('x', 0)
				.attr('y', 0)
				.attr('width', xScale.bandwidth())
				.attr(
						'height',
						d => sliderLayout.histYheight - yScale(d.length / featureValues.length)
				);
	},[row, row.covariate, ref.current]);

	const handleAddHandles = () => {
		if (rowInfos['type'] === 'continuous'){
			let range, min, max, cuts, ncuts;
			range = rowInfos['range'];
			min = Math.floor(range[0]);
			max = Math.ceil(range[1]);
			
			ncuts = values.length + 1;
			if(ncuts > 0){
				cuts = ncuts === 1 
					? [min] 
					: generate_array(min, max, Math.floor((max - min) / (ncuts - 1)));
				setValues([...cuts]);
				setUpdate([...cuts]);
				setManualBreaks(prevManualBreaks => {
					let updatedManualBreaks = [...prevManualBreaks];
					updatedManualBreaks[rowIndex]['breaks'] = cuts;
					return updatedManualBreaks;
				});
			}
		}
	};

	const handleDeleteHandles = () => {
		if (rowInfos['type'] === 'continuous'){
			let range, min, max, cuts, ncuts;
			range = rowInfos['range'];
			min = Math.floor(range[0]);
			max = Math.ceil(range[1]);
			
			ncuts = values.length - 1;
			if(ncuts > 0){
				cuts = ncuts === 1 
					? [min] 
					: generate_array(min, max, Math.floor((max - min) / (ncuts - 1)));
				setValues([...cuts]);
				setUpdate([...cuts]);
				setManualBreaks(prevManualBreaks => {
					let updatedManualBreaks = [...prevManualBreaks];
					updatedManualBreaks[rowIndex]['breaks'] = cuts;
					return updatedManualBreaks;
				});
			}
		}
	}


	const onUpdate = update => {
		setUpdate( update );
	};
	const onChange = values => {
		setValues( values );
		
		setManualBreaks(prevManualBreaks => {
			let updatedManualBreaks = [...prevManualBreaks];
			updatedManualBreaks[rowIndex]['breaks'] = values;
			return updatedManualBreaks;
		});
		
		// console.log('=== binSize:', 
		// 	_getBinSize(data, rowInfos['name'], values));
	};
	
	// if ((_.isEmpty(domain)) & (_.isEmpty(values)) & (_.isEmpty(update)))
	// 	return <div />

	return (
		<Grid container>
			<Grid item xs={12}>
				<div style={{ margin: "10px 0", height: "50px", width: "100%", paddingLeft: 10, paddingTop: '5px'}}>
					<svg ref={ref} width={sliderLayout.histXwidth} 
						height={sliderLayout.histYheight} 
						style={{ marginBottom: '-5px', marginRight: '-5px' }}
						></svg>
					{((!_.isEmpty(domain)) & (!_.isEmpty(values)) & (!_.isEmpty(update))) ? 
					(<Slider
						mode={2}
						step={0.5}
						domain={domain}
						rootStyle={{
							position: "relative",
							width: "100%"
						}}
						onUpdate={onUpdate}
						onChange={onChange}
						values={values}
					>
						<Rail>
							{({ getRailProps }) => <MuiRail getRailProps={getRailProps} />}
						</Rail>
						<Handles>
							{({ handles, getHandleProps }) => (
								<div className="slider-handles">
									{handles.map(handle => (
										<MuiHandle
											key={handle.id}
											handle={handle}
											domain={domain}
											getHandleProps={getHandleProps}
										/>
									))}
								</div>
							)}
						</Handles>
						{/* <Tracks left={true} right={true> */}
						<Tracks>
							{({ tracks, getTrackProps }) => (
								<div className="slider-tracks">
									{tracks.map(({ id, source, target }) => (
										<MuiTrack
											key={id}
											source={source}
											target={target}
											getTrackProps={getTrackProps}
										/>
									))}
								</div>
							)}
						</Tracks>
						<Ticks count={tickCounts}>
							{({ ticks }) => (
								<div className="slider-ticks">
									{ticks.map(tick => (
										<MuiTick key={tick.id} tick={tick} count={ticks.length} />
									))}
								</div>
							)}
						</Ticks>
					</Slider>) : (<div />)}
				</div>
			</Grid>
			<Grid item xs={8}></Grid>
			{(rowInfos['type'] === 'continuous') ? (
				<Grid item xs={4}>
					<Tooltip title="Click to add an additional slider handle">
						<AddBoxIcon fontSize="small" onClick={handleAddHandles}/>
					</Tooltip>
					<Tooltip title="Click to delete a slider handle">
						<IndeterminateCheckBoxIcon fontSize="small" onClick={handleDeleteHandles}/>
					</Tooltip>
				</Grid>
			) : (<div/>)}
		</Grid>
	);
}	

export default PartitionSlider;
