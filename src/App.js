import React, { Component } from 'react';
import { BrowserRouter as Router, Link, Route } from 'react-router-dom';
import './App.css';
import MapContainer from './components/MapContainer';
import SegmentTable from './components/SegmentTable';
import ActivityTable from './components/ActivityTable';
import Button from './components/Button';
import { observer, inject } from "mobx-react";
import AthleteSegmentsTable from "./components/AthleteSegmentsTable";


class App extends Component {
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
  getAthleteSegments() {
    fetch(`/athletesegments`)
      .then(res => res.json())
      //.then(json => json.message === 'Rate Limit Exceeded' ? Promise.reject() : json)
      .then(payload => console.log(payload));
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
    return (
      <div className="App">
        <Router>
          <div>
            <div className="scan-buttons">
              <Button buttonText="Scan activities for new segments"
                      onClick={() => this.getSegmentsForActivities(this.props.store.currentAthleteId)}
              />
              <Button buttonText="Refresh all segment efforts" onClick={this.getAllSegmentsEfforts}/>
              <Button buttonText="Refresh effortless segment efforts" onClick={this.getEffortlessSegmentsEfforts}/>
              <Button buttonText="Get all segments from athlete" onClick={this.getAthleteSegments}/>
            </div>
            <div className="tabs" id="navcontainer">
              <ul id="navlist" className="tables">
                <li><Link to="/athlete-segments">Athlete Segments</Link></li>
                <li><Link to="/">Activities</Link></li>
                <li><Link to="/segments">Segments</Link></li>
                <li><Link to="/map">Map</Link></li>
              </ul>
            </div>
            <Route exact path="/athlete-segments" render={() => <AthleteSegmentsTable />} />
            <Route exact path="/" render={() => <ActivityTable />} />
            <Route exact path="/segments" render={() => <SegmentTable />} />
            <Route exact path="/map" render={() => <MapContainer />} />
          </div>
        </Router>

      </div>
    );
  }
}
export default inject("store")(observer(App));