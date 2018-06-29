import React from 'react';
import Select from 'react-select';
import {csv} from 'd3-fetch';
import {format} from 'd3-format';
import Slider from './slider';
import Checkbox from './checkbox';

import {
  convertArrayToMap,
  filterYear,
  matchDomain,
  getGenreData,
  colorGenre,
  hintField
} from '../utils';

import {
  BUDGET_DOMAIN,
  GENRES_COLORS
} from '../constants';

import {
  XYPlot,
  XAxis,
  YAxis,
  VerticalGridLines,
  HorizontalGridLines,
  MarkSeries,
  Hint
} from 'react-vis';
// import InteractiveComponents from './interactive-parts';

class RootComponent extends React.Component {
  state = {
    // initialize all states as being initally selected
    selectedYear: 2017,
    selectedY: {value: 'revenue', label: 'Revenue(USD)'},
    loading: true,
    originalData: null,
    yearData: null,
    selectedGenre: convertArrayToMap(Object.keys(GENRES_COLORS), true),
    show: false,
    hintValue: null,
    chosen: null
  }

  componentWillMount() {
    // if the data you are going to import is small, then you can import it using es6 import
    // import MY_DATA from './data/example.json'
    // (I tend to think it's best to use screaming snake case for imported json)
    csv('data/data.csv')
      .then(data => this.setState({
        originalData: data,
        yearData: data,
        selectedData: data,
        loading: false
      }));
  }

  handleChange = (selectedOption) => {
    this.setState({selectedY: selectedOption});
    /* if (selectedOption) {
      console.log(`Selected: ${selectedOption.label}`);
    }*/
  }

  render() {
    const {selectedYear, selectedY, loading, originalData, yearData, selectedData,
      selectedGenre, chosen} = this.state;
    if (loading) {
      return (<div><h1>LOADING</h1></div>);
    }
    const yOptions = [
      {value: 'revenue', label: 'Revenue(USD)'},
      {value: 'popularity', label: 'Popularity(on TMDB)'},
      {value: 'rating', label: 'Rating(out of 10)'}
    ];
    const customStyles = {
      option: (base, state) => ({
        ...base,
        borderBottom: '1px dotted pink',
        color: 'blue',
        padding: 20
      }),
      control: () => ({
        // none of react-selects styles are passed to <View />
        width: 200
      }),
      singleValue: (base, state) => {
        const opacity = 1;
        const transition = 'opacity 300ms';
        return {...base, opacity, transition};
      }
    };
    const numSelectedColumns = Object.keys(selectedGenre)
      .reduce((acc, key) => acc + (selectedGenre[key] ? 1 : 0), 0);
    /* const testData = [
      {budget: '100000', language: 'en', popularity: '5.113205', date: '2/8/1915', revenue: '11000000'},
      {budget: '17311', language: 'en', popularity: '0.680407', date: '12/13/1915', revenue: '137365'},
      {budget: '250000', language: 'en', popularity: '8.168456', date: '1/21/1921', revenue: '2500000'},
      {budget: '1100000', language: 'en', popularity: '0.838095', date: '1/11/1922', revenue: '400200'},
      {budget: '1135654', language: 'en', popularity: '3.878515', date: '3/18/1924', revenue: '1213880'}
    ];*/
    return (
      <div className="flex center flex-column">
        <div className="title center">Did the Investment Pay off in Film Industry?</div>
        <p className="name"> by Cao Liu and Kevin Xiang </p>
        <p className="source"> Source:
          <a href="https://www.kaggle.com/rounakbanik/the-movies-dataset">The Full MovieLens Dataset</a>
        </p>
        <div className="flex flex-vert">
          <div className="flex">
            <XYPlot
              colorDomain={[0, 1]}
              xDomain = {BUDGET_DOMAIN}
              yDomain = {matchDomain(selectedY.value)}
              xType="log"
              yType={selectedY.value !== 'rating' ? 'log' : 'linear'}
              onMouseLeave={() => this.setState({hintValue: null, chosen: null})}
              width={1200}
              height={1000}
              margin={{left: 100, right: 100, top: 100, bottom: 100}}
              getX={d => Number(d.budget)}
              getY={d => Number(d[selectedY.value])}>
              {this.state.hintValue ?
                <Hint
                  value={this.state.hintValue}
                  format={hintField}/> :
                null
              }
              <VerticalGridLines />
              <HorizontalGridLines />
              <XAxis
                xType={'log'}
                tickFormat={tick => format('.1s')(tick)}
                tickLabelAngle={-90}
                tickTotal={20}
                tickSize={4}
                title="budget(log)"
                style={{
                  line: {stroke: '#ADDDE1'},
                  ticks: {stroke: '#ADDDE1'},
                  title: {fill: '#0e1111', fontWeight: 'bold', fontSize: '24'},
                  text: {stroke: 'none', fill: '#6b6b76'}
                }}/>
              <YAxis
                yType={selectedY.value !== 'rating' ? 'log' : 'linear'}
                tickFormat={tick => format(selectedY.value !== 'revenue' ? '.2r' : '.1s')(tick)}
                tickTotal={20}
                tickSize={4}
                title={selectedY.value !== 'rating' ? `${selectedY.value}(log)` : selectedY.value}
                style={{
                  line: {stroke: '#ADDDE1'},
                  ticks: {stroke: '#ADDDE1'},
                  title: {fill: '#0e1111', fontWeight: 'bold', fontSize: '24'},
                  text: {stroke: 'none', fill: '#6b6b76'}
                }}/>
              <MarkSeries
                className="mark-series"
                seriesId="scatterlot"
                colorType="literal"
                opacity={0.8}
                data={selectedData.map((d, i) =>
                  ({...d, color: i === chosen ? '#000011' : colorGenre(d, selectedGenre)}))}
                onNearestXY={(datapoint, {index}) =>
                  this.setState({hintValue: datapoint, chosen: index})
                }/>
            </XYPlot>
            <div className="controls-container">
              <p className="description"> Our visualization tries to investigate multiple relationships
               between a movie’s investment and its outcome under a given release year.</p>
              <div className="container pad-only-sides">
                <Slider value={selectedYear} range={[1915, 2017]} stepSize={1}
                  onChange={value => this.setState({
                    yearData: filterYear(originalData, value),
                    selectedData: getGenreData(filterYear(originalData, value), selectedGenre),
                    selectedYear: value
                  })}
                  sliderName={'year'} />
              </div>
              <div className="custom-select" >
                <p className="headline"> Select Relationship Type </p>
                <Select
                    styles={customStyles}
                    name="Choose Y Axis"
                    onChange={this.handleChange}
                    options={yOptions}
                    value={selectedY}
                    defaultValue={yOptions[0]}
                  />
              </div>
              <div className="box-container">
                <p className="headline"> Select Genre </p>
                {Object.keys(GENRES_COLORS).map((col, idx) => {
                  return (<Checkbox
                    key={idx}
                    onClick={() => {
                      selectedGenre[col] = !selectedGenre[col];
                      if (numSelectedColumns < 8) {
                        this.setState({
                          selectedGenre,
                          selectedData: getGenreData(yearData, selectedGenre)
                        });
                      } else {
                        this.setState({
                          selectedGenre,
                          selectedData: yearData
                        });
                      }
                    }}
                    label={col}
                    color={GENRES_COLORS[col]}
                    value={selectedGenre[col]}
                    />);
                })
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
RootComponent.displayName = 'RootComponent';
export default RootComponent;
