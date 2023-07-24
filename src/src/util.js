import { withThemeCreator } from '@material-ui/styles';
import {nest} from 'd3-collection';
import * as d3 from 'd3';
import styled from "styled-components";
import { makeStyles, useTheme } from '@material-ui/core/styles';
  
export const Title = styled.div.attrs({
    className: "title",
  })`
    height: 30px;
    font-weight: 300;
    font-size: 1.8em;
    color: #756bb1;
    // padding: 0.em 0.em;
    // background: #efedf5;
    margin-bottom: 20px;
    // border-bottom: 0.5px solid #bdbdbd;
  `;

export const SubTitle = styled.div.attrs({
    className: "subtitle",
  })`
    font-weight: 800;
    // color: #756bb1;
    color: #636363;
    font-size: 1.1rem;
    padding: 0.15em 0.15em;
    // background: lightgray;
    // padding-bottom: 1px;
    // border-bottom: 0.5px solid #bdbdbd;
  `;
  
export const CaptionTitle = styled.div.attrs({
    className: "configuration_title",
  })`
    font-weight: 400;
    color: dimgray;
    font-size: 0.8rem;
    padding-bottom: 0px;
    margin-top: 10px;
    margin-left: 8px;
  `;
export const LabelTitle = styled.div.attrs({
    className: "configuration_title",
  })`
    font-weight: 400;
    color: dimgray;
    font-size: 0.8rem;
    padding-bottom: 0px;
    margin-top: 0px;
    margin-left: 0px;
  `;

export const SmallTitle = styled.div.attrs({
    className: "configuration_title",
  })`
    font-weight: 350;
    color: dimgray;
    font-size: 0.8rem;
    padding-bottom: 0px;
    margin-top: 0px;
    text-align: center;
  `;

export const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    width: 120,
  },
	table: {
		minWidth: 300,
	},
  root: {
    flexGrow: 1.0,
    backgroundColor: theme.palette.background.paper
  },
  icon: {
    margin: theme.spacing(1.8),
    backgroundColor: "white",
    color: "gray",
    borderRadius: theme.shape.borderRadius
  }
}));