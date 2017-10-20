import React, { Component } from 'react';
import { BrowserRouter as Router, Link, Route } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import moment from 'moment';
const strava = require('strava-v3');


class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>

        <Router>
          <div>
            <div className="tabs" id="navcontainer">
              <ul id="navlist" className="tables">
                <li><Link to="/">Activities</Link></li>
                <li><Link to="/segments">Segments</Link></li>
              </ul>
            </div>
            <Route exact path="/" component={Activities} />
            <Route exact path="/segments" component={Segments} />
          </div>
        </Router>
      </div>
    );
  }
}

class Segments extends Component {
  constructor(props) {
    super(props);
    this.state = {
      segments: [],
    }
  }
  componentDidMount() {
    this.getDunedinSegments();
  }
  getCRs(segments) {
    segments.map(s =>
      fetch(`https://www.strava.com/api/v3/segments/${s.id}/leaderboard`, {
        headers: {
          Authorization: "Bearer 1e0c15bfece72d30bdc7fac56e3a90fae34508e8",
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }).then(response =>
        response.json().then(payload => {
          const segments = this.state.segments;
          const i = segments.findIndex(o => o.id === s.id);
          segments[i] = s;
          segments[i].cr = payload.entries[0];
          segments[i].entry_count = payload.entry_count;
          console.log(segments);
          this.setState({ segments });
        })
      )
    );
  }
  getDunedinSegments() {
    //-45.9100,170.4544   -45.8423,170.5676
    const [min_lat, min_long, max_lat, max_long] = [-45.9100, 170.4544, -45.8423, 170.5676];
    const iterator = n => f => {
      let iter = i => {
        if(i === n) return;
        f(i);
        iter(i+1);
      };
      return iter(0);
    };
    const splits = 3; // should create splits+1^2 sub-rects (16 if splits is 3)
    let long_points = [];
    let lat_points = [];
    iterator(splits)(i => {
      lat_points.push( (min_lat + ((max_lat-min_lat)/splits+1)*i) );
      long_points.push( (min_long + ((max_long-min_long)/splits+1)*i) );
    });
    console.log(long_points, lat_points);

    // TODO: now loop through the line locations and create a list of sub-rectangles

    this.getSegments(-45.9100, 170.4544, -45.8423, 170.5676);
  }
  getSegments(a_lat, a_long, b_lat, b_long) {
    //-45.911756,170.495793,-45.888165,170.535169
    fetch(`https://www.strava.com/api/v3/segments/explore?bounds=${a_lat},${a_long},${b_lat},${b_long}&activity_type=running`, {
      headers: {
        Authorization: "Bearer 1e0c15bfece72d30bdc7fac56e3a90fae34508e8",
        "Content-Type": "application/x-www-form-urlencoded"
      }
    }).then(response =>
      response.json().then(payload => {
        this.setState({ segments: [...this.state.segments, ...payload.segments] });
        //this.getCRs(payload.segments);
      })
    );
  }
  convertSpeedToPace(speed) {
    const total_seconds = 1000 / speed;
    const pace_seconds = (total_seconds % 60).toFixed(1) < 10 ? '0'+(total_seconds % 60).toFixed(1) : (total_seconds % 60).toFixed(1);
    return `${Math.floor(total_seconds/60)}:${pace_seconds}`;
  }
  render() {
    //console.log(this.state.segments);
    return (
    <div>
      <table>
        <thead>
        <tr><th>Name</th><th>Distance</th><th>Grade</th><th>Elevation</th><th>Efforts</th><th>CR Holder</th><th>Pace</th><th>HR</th><th>Distance</th><th>Elapsed</th><th>Moving</th><th>Rank</th><th>Date</th></tr>
        </thead>
        <tbody>
        {this.state.segments && this.state.segments.map(s =>
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.distance}</td>
              <td>{s.avg_grade}</td>
              <td>{s.elev_difference}</td>
              <td>{s.entry_count ? s.entry_count : ''}</td>
              <td>{s.cr ? s.cr.athlete_name : ''}</td>
              <td>{s.cr ? this.convertSpeedToPace(s.cr.distance/s.cr.elapsed_time) : ''}</td>
              <td>{s.cr ? s.cr.average_hr : ''}</td>
              <td>{s.cr ? s.cr.distance : ''}</td>
              <td>{s.cr ? s.cr.elapsed_time : ''}</td>
              <td>{s.cr ? s.cr.moving_time : ''}</td>
              <td>{s.cr ? s.cr.rank : ''}</td>
              <td>{s.cr ? s.cr.start_date_local : ''}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    );
  }
}

class Activities extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activities: [],
    }
  }
  componentDidMount() {
    this.getActivities(1);
  }
  getActivities(page) {
    fetch(`https://www.strava.com/api/v3/athlete/activities?page=${page}&per_page=200`, {
      headers: {
        Authorization: "Bearer 1e0c15bfece72d30bdc7fac56e3a90fae34508e8",
        "Content-Type": "application/x-www-form-urlencoded"
      }
    }).then(response =>
      response.json().then(activities => {
        this.setState({ activities });
      })
    );
  }
  handleClick(e) {
    e.preventDefault();
    this.getActivities(parseInt(e.target.innerHTML));
  }
  convertSpeedToPace(speed) {
    const total_seconds = 1000 / speed;
    const pace_seconds = (total_seconds % 60).toFixed(1) < 10 ? '0'+(total_seconds % 60).toFixed(1) : (total_seconds % 60).toFixed(1);
    return `${Math.floor(total_seconds/60)}:${pace_seconds}`;
  }
  calculateGAP(speed, grade) {
    //console.log(speed, grade);
    return speed / (1 + (9 * grade));
  }
  calculateFitness(speed, hr) {
    //console.log(hr, speed);
    return (hr/speed).toFixed(0);
  }
  render() {
    return (
      <div>
        <Zones />
        <Pagination getActivities={this.handleClick.bind(this)} />
        <table>
          <thead>
          <tr><th>Date</th><th>Activity</th><th>Elevation</th><th>Distance</th><th>Time</th><th>Pace</th><th>HR</th><th>Fitness</th></tr>
          </thead>
          <tbody>
            {this.state.activities.filter(a => a.type === 'Run' && !a.trainer)
              .map(a =>
              <tr key={a.id}>
                <td>{moment(a.start_date).format('D MMM YY')}</td>
                <td>{a.name}</td>
                <td>{a.total_elevation_gain} m</td>
                <td>{(a.distance/1000).toFixed(2)} km</td>
                <td>{moment.utc(a.moving_time*1000).format('HH:mm:ss')}</td>
                <td>{this.convertSpeedToPace(a.average_speed)}/km</td>
                <td>{a.average_heartrate ? a.average_heartrate.toFixed(1) : '000.0'} bpm</td>
                <td>{this.calculateFitness(a.average_speed, a.average_heartrate)}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }
}

class Pagination extends Component {
  constructor(props) {
    super(props);
    this.state = {
      athlete: {},
    }
  }
  componentDidMount() {
    this.getAthlete(4734138);
  }
  getAthlete(athleteId) {
    fetch(`https://www.strava.com/api/v3/athletes/${athleteId}/stats`, {
      headers: {
        Authorization: "Bearer 1e0c15bfece72d30bdc7fac56e3a90fae34508e8",
        "Content-Type": "application/x-www-form-urlencoded"
      }
    }).then(response =>
      response.json().then(athlete => {
        this.setState({ athlete });
      })
    );
  }
  render() {
    if(!this.state.athlete.all_ride_totals
        || !this.state.athlete.all_run_totals
        || !this.state.athlete.all_swim_totals) return (<ul></ul>);
    const activity_total = this.state.athlete.all_ride_totals.count + this.state.athlete.all_run_totals.count + this.state.athlete.all_swim_totals.count;
    let pages = [...Array(Math.ceil(activity_total/200)).keys()];
    return (
      <ul className="zones">{pages.map(p => <li key={p} onClick={this.props.getActivities}><a href="#">{p+1}</a></li>)}</ul>
    );
  }
}

class Zones extends Component {
  constructor(props) {
    super(props);
    this.state = {
      zones: [],
    }
  }
  componentDidMount() {
    this.getZones();
  }
  getZones() {
    fetch(`https://www.strava.com/api/v3/athlete/zones`, {
      headers: {
        Authorization: "Bearer 1e0c15bfece72d30bdc7fac56e3a90fae34508e8",
        "Content-Type": "application/x-www-form-urlencoded"
      }
    }).then(response =>
      response.json().then(payload => {
        this.setState({ zones: payload.heart_rate.zones });
      })
    );
  }
  render() {
    const zone_labels = ['Endurance', 'Moderate', 'Tempo', 'Threshold', 'Anaerobic'];
    return (
      <ul className="zones">{this.state.zones.map((z, index) => <li key={index}>{zone_labels[index]}:{z.min}-{z.max}</li>)}</ul>
    );
  }
}

class StravaAthlete extends Component {
  constructor(props) {
    super(props);
    this.state = {
      athlete: {},
    }
  }
  componentDidMount() {
    this.getAthlete(4734138);
  }
  getAthlete(athleteId) {
    strava.athlete.get(
      {'access_token':'1e0c15bfece72d30bdc7fac56e3a90fae34508e8', id: parseInt(athleteId, 10)},
      (err, payload, limits) => err ? console.log(err) : this.setState({ athlete: payload }),
    );
  }
  render() {
    return (
      <div>
        <input type="text" onChange={(e) => this.getAthlete(e.target.value)} />
        <pre>{JSON.stringify(this.state.athlete, null, 2)}</pre>
      </div>
    );
  }
}

export default App;
