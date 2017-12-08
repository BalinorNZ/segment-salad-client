import React, { Component } from 'react';
import { BrowserRouter as Router, Link, Route } from 'react-router-dom';
import './App.css';
import Map from './Components/Map';
import SegmentTable from './Components/SegmentTable';
import ActivityTable from './Components/ActivityTable';
import * as _ from 'lodash';


class App extends Component {
  state = {
    segments: [],
    athlete_segments: [],
    isFetchingSegments: true,
  };

  componentDidMount() {
    // fetch(`/authenticate`)
    //   .then(res => res.json())
    //   .then(auth => console.log(auth));
    // TODO: replace with athlete_id from input box
    const athlete_id = 4734138;
    //-45.911756,170.495793,-45.888165,170.535169
    const { a_lat, a_long, b_lat, b_long } =
      { a_lat: -45.9100, a_long: 170.4544, b_lat: -45.8423, b_long: 170.5676 };
    fetch(`/segments/explore/${a_lat}/${a_long}/${b_lat}/${b_long}`)
      .then(res => res.json())
      .then(segments => segments.map(s =>
        Object.assign({}, s, { segment_id: s.id, speed: s.distance/s.elapsed_time, effort_speed: s.effort_distance/s.elapsed_time })))
      .then(segments => this.setState(Object.assign({}, this.state, { segments, isFetchingSegments: false })));
    fetch(`/athletes/${athlete_id}/segments`)
      .then(res => res.json())
      .then(segments => segments.map(s =>
        Object.assign({}, s, { segment_id: s.id, speed: s.distance/s.elapsed_time, effort_speed: s.effort_distance/s.elapsed_time })))
      .then(athlete_segments => this.setState(Object.assign({}, this.state, { athlete_segments })));
  };
  filterSegments = athlete_id => {
    if(!athlete_id){
      this.getAllSegments();
      return;
    }
    fetch(`/athletes/${athlete_id}/segments`)
      .then(res => res.json())
      .then(segments => segments.map(s =>
        Object.assign({}, s, { segment_id: s.id, speed: s.distance/s.elapsed_time, effort_speed: s.effort_distance/s.elapsed_time })))
      .then(segments => this.setState(Object.assign({}, this.state, { segments })));
  };
  getAllSegments = () => {
    const { a_lat, a_long, b_lat, b_long } =
      { a_lat: -45.9100, a_long: 170.4544, b_lat: -45.8423, b_long: 170.5676 };
    fetch(`/segments/explore/${a_lat}/${a_long}/${b_lat}/${b_long}`)
      .then(res => res.json())
      .then(segments => segments.map(s =>
        Object.assign({}, s, { segment_id: s.id, speed: s.distance/s.elapsed_time, effort_speed: s.effort_distance/s.elapsed_time })))
      .then(segments => this.setState(Object.assign({}, this.state, { segments, isFetchingSegments: false })));
  };
  updateSegmentLeaderboard(e, id) {
    e.preventDefault();
    fetch(`/segments/${id}/updateleaderboard`)
      .then(res => res.json())
      .then(efforts => console.log(efforts[0]));
  }
  render() {
    return (
      <div className="App">
        <FilterMenuContainer filterSegments={this.filterSegments} segments={this.state.segments} />
        <Map segments={this.state.segments} athleteSegments={this.state.athlete_segments} updateSegmentLeaderboard={this.updateSegmentLeaderboard} />
        <Router>
          <div>
            <div className="tabs" id="navcontainer">
              <ul id="navlist" className="tables">
                <li><Link to="/">Activities</Link></li>
                <li><Link to="/segments">Segments</Link></li>
              </ul>
            </div>
            <Route exact path="/" component={ActivityTable} />
            <Route exact
                   path="/segments"
                   render={() =>
                     <SegmentTable segments={this.state.segments} isFetching={this.state.isFetchingSegments}/>}
            />
          </div>
        </Router>
      </div>
    );
  }
}

export default App;

class FilterMenuContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {visible: true};
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.toggleMenu = this.toggleMenu.bind(this);
  }

  toggleMenu() {
    this.setState({ visible: !this.state.visible });
  };
  handleMouseDown(e) {
    this.toggleMenu();
    e.stopPropagation();
  };
  render() {
    return (
      <div>
        {/*<MenuButton handleMouseDown={this.handleMouseDown} />*/}
        <FilterMenu handleMouseDown={this.handleMouseDown}
                    menuVisibility={this.state.visible}
                    filterSegments={this.props.filterSegments}
                    segments={this.props.segments} />
      </div>
    );
  }
}

class FilterMenu extends Component {
  state = {
    athlete_id: '',
  };
  handleChange = e => {
    this.setState({ athlete_id: e.target.value });
    console.log(this.state.athlete_id);
  };
  render() {
    const visibility = this.props.menuVisibility ? "show": "hide";
    const arrow = this.props.menuVisibility ? "◁" : "▷";
    const groups = _.groupBy(this.props.segments, s => s.athlete_name);
    const sortedGroups = _.sortBy(Object.keys(groups)
      .map(athlete => ({ athlete, segment_count: groups[athlete].length })), 'segment_count')
      .reverse()
      .slice(0, 20);

    return (
      <div id="filter-menu" className={visibility}>
        <div className="filter-menu-toggle-button-container" onClick={this.props.handleMouseDown}>
        <button className="filter-menu-toggle-button">{arrow}</button>
        </div>
        <div className="filter-menu-contents">
          <h4>Athlete ID</h4>
          <input className="text" type="text" name="athlete_id" onChange={this.handleChange} />
          <input className="btn" type="submit" value="Filter" onClick={() => this.props.filterSegments(this.state.athlete_id)} />
          <h4>Club</h4>
          <select className="text"onChange={this.handleChange}><option value='blank'></option></select>
          <input className="btn" type="submit" value="Filter" onClick={() => this.props.filterSegments(this.state.athlete_id)} />

          <div className="leaderboard">
            <h3>Leaderboard</h3>
            <ul>
              {sortedGroups.map(athlete =>
                <li>
                  <span className="athlete-name">{athlete.athlete}:</span>
                  <span className="segment-count">{athlete.segment_count}</span>
                </li>
              )}
            </ul>
            <p><b>Total segments:</b> {this.props.segments.length}</p>
          </div>
        </div>
      </div>
    );
  }
}

class MenuButton extends Component {
  render() {
    return (<button className="roundButton" onMouseDown={this.props.handleMouseDown}></button>);
  }
}