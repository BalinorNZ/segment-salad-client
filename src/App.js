import React, { Component } from 'react';
import { BrowserRouter as Router, Link, Route } from 'react-router-dom';
import './App.css';
import Map from './Components/Map';
import FilterMenu from './Components/FilterMenu';
import SegmentTable from './Components/SegmentTable';
import ActivityTable from './Components/ActivityTable';
import Button from './Components/Button';


class App extends Component {
  state = {
    current_athlete_id: 4734138, //TODO: this should be set dynamically after authenticating with Strava
    solo_athlete_id: undefined,
    hide_athlete_id: undefined,
    segments: [],
    athlete_segments: [],
    filtered_segments: [],
    isFetchingSegments: true,
    clubs: [],
    athletes: [],
  };

  componentDidMount() {
    // get list of segments with CR efforts attached
    fetch(`/segments`)
      .then(res => res.json())
      .then(segments => segments.map(s =>
        Object.assign({}, s, { segment_id: s.id, speed: s.distance/s.elapsed_time, effort_speed: s.effort_distance/s.elapsed_time })))
      .then(segments => this.setState(Object.assign({}, this.state, { segments, isFetchingSegments: false })));

    // get list of segments with current athlete's PB efforts attached
    fetch(`/athletes/${this.state.current_athlete_id}/segments`)
      .then(res => res.json())
      .then(segments => segments.map(s =>
        Object.assign({}, s, { segment_id: s.id, speed: s.distance/s.elapsed_time, effort_speed: s.effort_distance/s.elapsed_time })))
      .then(athlete_segments => this.setState(Object.assign({}, this.state, { athlete_segments })));

    fetch(`/list_clubs`)
      .then(res => res.json())
      .then(clubs => this.setState(Object.assign({}, this.state, { clubs })));

    fetch(`/athletes`)
      .then(res => res.json())
      .then(athletes => this.setState(Object.assign({}, this.state, { athletes })));
  };
  soloAthlete = athlete_id => {
    const solo_athlete_id = athlete_id === this.state.solo_athlete_id ? undefined : athlete_id;
    const filtered_segments = this.state.segments.filter(s => s.athlete_id === athlete_id);
    this.setState(Object.assign({}, this.state, { filtered_segments, solo_athlete_id }));
  };
  hideAthlete = athlete_id => {
    const hide_athlete_id = athlete_id === this.state.hide_athlete_id ? undefined : athlete_id;
    const filtered_segments = this.state.segments.filter(s => s.athlete_id !== athlete_id);
    this.setState(Object.assign({}, this.state, { filtered_segments, hide_athlete_id }));
  };
  filterSegmentsByAthlete = athlete_id => {
    if(!athlete_id){
      this.getAllSegments();
      return;
    }
    console.log("filter by athlete", athlete_id);
    fetch(`/athletes/${athlete_id}/segments`)
      .then(res => res.json())
      .then(segments => segments.map(s =>
        Object.assign({}, s, { segment_id: s.id, speed: s.distance/s.elapsed_time, effort_speed: s.effort_distance/s.elapsed_time })))
      .then(segments => this.setState(Object.assign({}, this.state, { segments })));
  };
  filterSegmentsByClub = club_id => {
    if(!club_id){
      this.getAllSegments();
      return;
    }
    fetch(`/clubs/${club_id}/segments`)
      .then(res => res.json())
      .then(segments => segments.map(s =>
        Object.assign({}, s, { segment_id: s.id, speed: s.distance/s.elapsed_time, effort_speed: s.effort_distance/s.elapsed_time })))
      .then(segments => this.setState(Object.assign({}, this.state, { segments })));
  };
  getAllSegments = () => {
    fetch(`/segments`)
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
      this.state.filtered_segments : this.state.segments;
    return (
      <div className="App">

        <FilterMenu
          filterSegmentsByAthlete={this.filterSegmentsByAthlete}
          filterSegmentsByClub={this.filterSegmentsByClub}
          segments={this.state.segments}
          clubs={this.state.clubs}
          athletes={this.state.athletes}
          soloAthlete={this.soloAthlete}
          hideAthlete={this.hideAthlete}
          soloAthleteId={this.state.solo_athlete_id}
          hideAthleteId={this.state.hide_athlete_id}
        />

        <Map segments={segments_to_render}
             athleteSegments={this.state.athlete_segments}
             updateSegmentLeaderboard={this.updateSegmentLeaderboard}
        />

        <Button buttonText="Scan activities for new segments"
                onClick={() => this.getSegmentsForActivities(this.state.current_athlete_id)}/>
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
            <Route exact path="/" render={() => <ActivityTable athlete={this.state.current_athlete_id}/>} />
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