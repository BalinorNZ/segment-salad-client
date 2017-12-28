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

        <FilterMenu />

        <Map />

        <Button buttonText="Scan activities for new segments"
                onClick={() => this.getSegmentsForActivities(this.props.store.currentAthleteId)}
        />
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
            <Route exact path="/" render={() => <ActivityTable />} />
            <Route exact path="/segments" render={() => <SegmentTable />} />
          </div>
        </Router>

      </div>
    );
  }
}
export default inject("store")(observer(App));