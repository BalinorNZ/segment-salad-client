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
    segments: [],
    athlete_segments: [],
    isFetchingSegments: true,
    clubs: [],
  };

  componentDidMount() {
    // fetch(`/authenticate`)
    //   .then(res => res.json())
    //   .then(auth => console.log(auth));
    // TODO: replace with athlete ID of authenticated user
    const athlete_id = 4734138;
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

    fetch(`/list_clubs`)
      .then(res => res.json())
      .then(clubs => this.setState(Object.assign({}, this.state, { clubs })));
  };
  filterSegmentsByAthlete = athlete_id => {
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
  getSegmentsForActivities() {
    fetch(`/activities/segments/1`)
      .then(res => res.json())
      .then(payload => console.log(payload));
  }
  render() {
    return (
      <div className="App">

        <FilterMenu
          filterSegmentsByAthlete={this.filterSegmentsByAthlete}
          filterSegmentsByClub={this.filterSegmentsByClub}
          segments={this.state.segments}
          clubs={this.state.clubs}
        />

        <Map segments={this.state.segments}
             athleteSegments={this.state.athlete_segments}
             updateSegmentLeaderboard={this.updateSegmentLeaderboard}
        />

        <Button buttonText="Scan activities for new segments" onClick={this.getSegmentsForActivities}/>

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