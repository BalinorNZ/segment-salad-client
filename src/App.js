import React, { Component } from 'react';
import { BrowserRouter as Router, Link, Route } from 'react-router-dom';
import './App.css';
import Map from './components/Map';
import FilterMenu from './components/FilterMenu';
import SegmentTable from './components/SegmentTable';
import ActivityTable from './components/ActivityTable';
import Button from './components/Button';
import { observer, inject } from "mobx-react";


class App extends Component {
  state = {
    solo_athlete_id: undefined,
    hide_athlete_id: undefined,
    filtered_segments: [],
  };

  componentDidMount() {
    // get list of segments with CR efforts attached
    this.props.store.fetchSegments().then(() => this.props.store.updateReduxState());
    // get list of segments with current athlete's PB efforts attached
    this.props.store.fetchAthleteSegments().then(() => this.props.store.updateReduxState());
    // get clubs for club select filter
    this.props.store.fetchClubs().then(() => this.props.store.updateReduxState());
    // get athletes for athlete autocomplete filter
    this.props.store.fetchAthletes().then(() => this.props.store.updateReduxState());
  };
  soloAthlete = athlete_id => {
    const solo_athlete_id = athlete_id === this.state.solo_athlete_id ? undefined : athlete_id;
    const filtered_segments = this.props.segments.filter(s => s.athlete_id === athlete_id);
    this.setState(Object.assign({}, this.state, { filtered_segments, solo_athlete_id }));
  };
  hideAthlete = athlete_id => {
    const hide_athlete_id = athlete_id === this.state.hide_athlete_id ? undefined : athlete_id;
    const filtered_segments = this.props.segments.filter(s => s.athlete_id !== athlete_id);
    this.setState(Object.assign({}, this.state, { filtered_segments, hide_athlete_id }));
  };
  filterSegmentsByAthlete = athlete_id => {
    if(!athlete_id){
      this.getAllSegments();
      return;
    }
    this.props.store.fetchSegmentsByAthlete(athlete_id)
      .then(() => this.props.store.updateReduxState());
  };
  filterSegmentsByClub = club_id => {
    if(!club_id){
      this.getAllSegments();
      return;
    }
    this.props.store.fetchSegmentsByClub(club_id)
      .then(() => this.props.store.updateReduxState());
  };
  getAllSegments = () => {
    this.props.store.fetchSegments().then(() =>  this.props.store.updateReduxState());
  };
  updateSegmentLeaderboard(e, id) {
    e.preventDefault();
    fetch(`/segments/${id}/updateleaderboard`)
      .then(res => res.json())
      .then(efforts => console.log(efforts[0]));
  }
  getSegmentsForActivities(athlete_id) {
    fetch(`/segments/scanactivities/${athlete_id}`)
      .then(res => res.json())
      .then(payload => console.log(payload));
  }
  getAllSegmentsEfforts() {
    fetch(`/maintenance/updateallleaderboards/all`)
      .then(res => res.json())
      .then(payload => console.log(payload));
  }
  getEffortlessSegmentsEfforts() {
    fetch(`/maintenance/updateallleaderboards/effortless`)
      .then(res => res.json())
      .then(payload => console.log(payload));
  }
  render() {
    const segments_to_render = this.state.solo_athlete_id || this.state.hide_athlete_id ?
      this.state.filtered_segments : this.props.store.getSegments();
    return (
      <div className="App">

        <FilterMenu
          filterSegmentsByAthlete={this.filterSegmentsByAthlete}
          filterSegmentsByClub={this.filterSegmentsByClub}
          soloAthlete={this.soloAthlete}
          hideAthlete={this.hideAthlete}
          soloAthleteId={this.state.solo_athlete_id}
          hideAthleteId={this.state.hide_athlete_id}
        />

        <Map segments={segments_to_render}
             updateSegmentLeaderboard={this.updateSegmentLeaderboard}
        />

        <Button buttonText="Scan activities for new segments"
                onClick={() => this.getSegmentsForActivities(this.props.store.current_athlete_id)}/>
        <Button buttonText="Refresh all segment efforts" onClick={this.getAllSegmentsEfforts}/>
        <Button buttonText="Refresh effortless segment efforts" onClick={this.getEffortlessSegmentsEfforts}/>

        <Router>
          <div>
            <div className="tabs" id="navcontainer">
              <ul id="navlist" className="tables">
                <li><Link to="/">Activities</Link></li>
                <li><Link to="/segments">Segments</Link></li>
              </ul>
            </div>
            <Route exact path="/" render={() => <ActivityTable athlete={this.props.store.current_athlete_id}/>} />
            <Route exact
                   path="/segments"
                   render={() =>
                     <SegmentTable />}
            />
          </div>
        </Router>

      </div>
    );
  }
};
export default inject("store")(observer(App));