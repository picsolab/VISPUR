import React, { useRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import axios from 'axios';
import styled from "styled-components";
import 'antd/dist/antd.css';
import './App.css';
import './index.css';

import Generator from './components/Generator/Generator';
import XYSpace from './components/XYSpace/XYSpace';
import StoryTelling from './components/StoryTelling/StoryTelling';
import CovariateSpace from './components/CovariateSpace/CovariateSpace';
import LocalDiagnosis from './components/LocalDiagnosis/LocalDiagnosis';

const Container = styled.div.attrs({
  className: "container",
})`
    width: 1300px;
    margin: 10px auto;
    /* font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; */
    font-family: "Graphik Webfont",-apple-system,"Helvetica Neue","Droid Sans",Arial,sans-serif;
    display: grid;
    // grid-template-rows: 60px 350px 500px 300px;
    grid-template-rows: 60px 280px 500px 300px;
    grid-template-columns: 28% 43% 29%;
    grid-template-areas:
      "h h h"
      "g c l"
      "g xy l"
      "g st st";
`
const AppTitle = styled.div.attrs({
  className: "app_title",
})`
  font-weight: 200;
  font-size: 2.1rem;
  color: white;
  background: #756bb1;
  padding: 2px 10px;
`

const Header = styled.div.attrs({
  className: "header",
})`
  grid-area: h;
`

const App = () => {
  const [data, setData] = useState([]),
    [population, setPopulation] = useState({ data: [], imbScores: {} }),
    [subgroups, setSubgroups] = useState({GroupIDList: [], imbScores: []}),
    [selectedSubgroups, setSelectedSubgroups] = useState(new Set()),
    [features, setFeatures] = useState([]),
    [selectedFeatures, setSelectedFeatures] = useState({
        cause: {},
        outcome: {},
        Z: [], // the rest variables except for cause/outcome
        covariates: [] // selected covariates
    }),
    [summaryDataForCS, setSummaryDataForCS] = useState({'population': [], 'subgroup': []}),
    [regressionResults, setRegressionResults] = useState({'population': [], 'subgroup': []}),
    [summaryDataForST, setSummaryDataForST] = useState({'population': [], 'subgroup': []}),
    [summaryDataForXY, setSummaryDataForXY] = useState({'population': [], 'subgroup': []}),
    [discScores, setDiscScores] = useState([]),
    [gNames, setGNames] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      await axios({
        method: 'get',
        url: 'dataset/loadFile/'
      }).then(res => {
        setData(JSON.parse(res.data));
        setPopulation((prevState) => ({
          ...prevState,
          data: JSON.parse(res.data)
        }));
      });      
    };

    const fetchFeatures = async () => {
      await axios({
        method: 'get',
        url: 'dataset/extractFeatures/'
      }).then(res => {
        setFeatures(res.data.features);
        setSelectedFeatures(prevState => ({
          ...prevState,
          Z: res.data.features
        }))
      });
    };

    fetchData();
    fetchFeatures();
  }, []);

  

  
  if ((!features || features.length === 0) || (!selectedFeatures.Z || selectedFeatures.Z.length === 0)) 
    return <div />

  
  return (
    <Container>
      <Header>
        <AppTitle>Vispur Tool</AppTitle>
      </Header>
      <Generator 
        data={population['data']}
        features={features}
        subgroups={subgroups}
        selectedFeatures={selectedFeatures}
        setSelectedFeatures={setSelectedFeatures}
        setPopulation={setPopulation}
        setSubgroups={setSubgroups}
        setRegressionResults={setRegressionResults}
        setSummaryDataForST={setSummaryDataForST}
        setSummaryDataForXY={setSummaryDataForXY}
        setSummaryDataForCS={setSummaryDataForCS}
        setDiscScores={setDiscScores}
        setGNames={setGNames}
      />
      <XYSpace 
        data={population['data']}
        subgroups={subgroups}
        selectedFeatures={selectedFeatures}
        summaryDataForXY={summaryDataForXY}
        regressionResults={regressionResults}
        selectedSubgroups={selectedSubgroups}
        setSelectedSubgroups={setSelectedSubgroups}
        gNames={gNames}
      />
      <StoryTelling 
        data={population['data']}
        subgroups={subgroups}
        selectedFeatures={selectedFeatures}
        summaryDataForST={summaryDataForST}
      />
      <LocalDiagnosis
        population={population}
        subgroups={subgroups}
        selectedFeatures={selectedFeatures}
      />
      <CovariateSpace 
        features={features}
        summaryDataForCS={summaryDataForCS}
        selectedFeatures={selectedFeatures}
        discScores={discScores}
        selectedSubgroups={selectedSubgroups}
        setSelectedSubgroups={setSelectedSubgroups}
        gNames={gNames}
      />
      <LocalDiagnosis
        regressionResults={regressionResults}
        population={population}
        subgroups={subgroups}
        selectedFeatures={selectedFeatures}
      />
    </Container>
  );
}

export default App;
