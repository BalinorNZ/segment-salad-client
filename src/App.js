import React, { Component } from 'react';
import { BrowserRouter as Router, Link, Route } from 'react-router-dom';
import './App.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import moment from 'moment';
import * as _ from 'lodash';


class App extends Component {
  render() {
    return (
      <div className="App">
        <Mapbox />
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

class Mapbox extends React.Component {
  componentDidMount() {
    mapboxgl.accessToken = 'pk.eyJ1IjoibmljYmF0aGdhdGUiLCJhIjoiY2phOWYxcjQ3MGg2ZzMwcTlhamJ6Z21pMiJ9.kA5eVyN3PH56G-5u56-Q4A';
    this.map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/mapbox/streets-v10',
      center: [170.5000, -45.8758],
      zoom: 11,
      minZoom: 9,
      maxZoom: 24,
    });
    this.map.addControl(new mapboxgl.NavigationControl());
    // TODO get list of GeoJSON lines for segments, programatically render them
    this.map.on('load', function () {
      this.addLayer({
        "id": "route",
        "type": "line",
        "source": {
          "type": "geojson",
          "data": {
            "type": "Feature",
            "properties": {},
            "geometry": {
              "type": "LineString",
              "coordinates": [
                [170.4544, -45.9100],
                [170.5676, -45.8423],
              ]
            }
          }
        },
        "layout": {
          "line-join": "round",
          "line-cap": "round"
        },
        "paint": {
          "line-color": "#ff7200",
          "line-width": 3
        }
      });
    });
  }
  componentWillUnmount() {
    this.map.remove();
  }
  render() {
    const style = {
      position: 'relative',
      top: 0,
      bottom: 0,
      width: '100%',
      height: '400px',
    };
    return <div style={style} ref={el => this.mapContainer = el} />;
  }
}


class Segments extends Component {
  state = {
    segments: [],
    isFetching: true,
    sort: 'name',
    order: 'ASC',
  };

  componentDidMount() {
    //-45.911756,170.495793,-45.888165,170.535169
    const { a_lat, a_long, b_lat, b_long } =
      { a_lat: -45.9100, a_long: 170.4544, b_lat: -45.8423, b_long: 170.5676 };
    fetch(`/segments/explore/${a_lat}/${a_long}/${b_lat}/${b_long}`)
      .then(res => res.json())
      .then(segments => segments.map(s => Object.assign({}, s, { speed: s.distance/s.elapsed_time })))
      .then(segments => this.setState(Object.assign({}, this.state, { segments, isFetching: false })));
  }
  convertSpeedToPace(speed) {
    const total_seconds = 1000 / speed;
    const pace_seconds = (total_seconds % 60).toFixed(1) < 10 ? '0'+(total_seconds % 60).toFixed(1) : (total_seconds % 60).toFixed(1);
    return `${Math.floor(total_seconds/60)}:${pace_seconds}`;
  }
  sortSegments(field) {
    console.log(field, this.state.order);
    this.state.order === 'ASC' ? this.setState(Object.assign({}, this.state, { sort: field, order: 'DESC' }))
    : this.setState(Object.assign({}, this.state, { sort: field, order: 'ASC' }));
  }
  render() {
    if(this.state.isFetching) return(<Spinner />);

    let sorted_segments = _.sortBy(this.state.segments, (segment) => segment[this.state.sort]);
    if(this.state.order === 'DESC') sorted_segments = sorted_segments.reverse();
    return (
    <div class="segment-view">
      <div>Segments: {sorted_segments.length}</div>
      <table>
        <thead>
        <tr>
          <th></th>
          <th onClick={() => this.sortSegments('name')}>Name</th>
          <th onClick={() => this.sortSegments('avg_grade')}>Grade</th>
          <th onClick={() => this.sortSegments('elev_difference')}>Elevation</th>
          <th onClick={() => this.sortSegments('entry_count')}>Efforts</th>
          <th onClick={() => this.sortSegments('athlete_name')}>CR Holder</th>
          <th onClick={() => this.sortSegments('speed')}>Pace</th>
          <th onClick={() => this.sortSegments('average_hr')}>HR</th>
          <th onClick={() => this.sortSegments('distance')}>Distance</th>
          <th onClick={() => this.sortSegments('elapsed_time')}>Elapsed</th>
          <th onClick={() => this.sortSegments('moving_time')}>Moving</th>
          <th onClick={() => this.sortSegments('rank')}>Rank</th>
          <th>Date</th>
        </tr>
        </thead>
        <tbody>
        {sorted_segments && sorted_segments.map((s, index) =>
            <tr key={s.id+s.activity_id} id={s.id}>
              <td>{index+1}</td>
              <td>{s.name}</td>
              <td>{s.avg_grade}</td>
              <td>{s.elev_difference}</td>
              <td>{s.entry_count ? s.entry_count : ''}</td>
              <td>{s.athlete_name}</td>
              <td>{this.convertSpeedToPace(s.speed)}</td>
              <td>{s.average_hr}</td>
              <td>{s.distance}</td>
              <td>{s.elapsed_time}</td>
              <td>{s.moving_time}</td>
              <td>{s.rank}</td>
              <td>{s.start_date_local}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    );
  }
}

class Activities extends Component {
  state = { activities: [], isFetching: true };

  componentDidMount() {
    this.getActivities(1);
  }
  getActivities(page) {
    fetch(`/activities/${page}`)
      .then(res => res.json())
      .then(activities => this.setState({ activities, isFetching: false }));
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
    if(this.state.isFetching) return(<Spinner />);

    return (
      <div class="athlete-view">
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
  state = { athlete: {} };

  componentDidMount() {
    this.getAthlete(4734138);
  }
  getAthlete(id) {
    fetch(`/athletes/${id}/stats`)
      .then(res => res.json())
      .then(athlete => this.setState({ athlete }));
  }
  render() {
    if(!this.state.athlete.all_ride_totals
        || !this.state.athlete.all_run_totals
        || !this.state.athlete.all_swim_totals) return (<ul></ul>);
    const activity_total = this.state.athlete.all_ride_totals.count + this.state.athlete.all_run_totals.count + this.state.athlete.all_swim_totals.count;
    let pages = [...Array(Math.ceil(activity_total/50)).keys()];
    return (
      <ul className="zones">{pages.map(p => <li key={p} onClick={this.props.getActivities}><a href="#">{p+1}</a></li>)}</ul>
    );
  }
}

class Zones extends Component {
  state = { zones: [] };

  componentDidMount() {
    this.getZones();
  }
  getZones() {
    fetch(`/athlete/zones`)
      .then(res => res.json())
      .then(payload => this.setState({ zones: payload.heart_rate.zones }));
  }
  render() {
    const zone_labels = ['Endurance', 'Moderate', 'Tempo', 'Threshold', 'Anaerobic'];
    return (
      <ul className="zones">{this.state.zones.map((z, index) => <li key={index}>{zone_labels[index]}:{z.min}-{z.max}</li>)}</ul>
    );
  }
}

const Spinner = (props) => (
  <div className="sk-circle">
    <div className="sk-circle1 sk-child"></div>
    <div className="sk-circle2 sk-child"></div>
    <div className="sk-circle3 sk-child"></div>
    <div className="sk-circle4 sk-child"></div>
    <div className="sk-circle5 sk-child"></div>
    <div className="sk-circle6 sk-child"></div>
    <div className="sk-circle7 sk-child"></div>
    <div className="sk-circle8 sk-child"></div>
    <div className="sk-circle9 sk-child"></div>
    <div className="sk-circle10 sk-child"></div>
    <div className="sk-circle11 sk-child"></div>
    <div className="sk-circle12 sk-child"></div>
  </div>
);

export default App;