import React, { Component } from 'react';
import { BrowserRouter as Router, Link, Route } from 'react-router-dom';
import './App.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import ReactMapboxGl, { Layer, Feature, Source, GeoJSONLayer  } from "react-mapbox-gl";
import moment from 'moment';
import * as _ from 'lodash';
import polyline from 'polyline';


class App extends Component {
  state = {
    segments: [],
    isFetchingSegments: true,
  };

  componentDidMount() {
    //-45.911756,170.495793,-45.888165,170.535169
    const { a_lat, a_long, b_lat, b_long } =
      { a_lat: -45.9100, a_long: 170.4544, b_lat: -45.8423, b_long: 170.5676 };
    fetch(`/segments/explore/${a_lat}/${a_long}/${b_lat}/${b_long}`)
      .then(res => res.json())
      .then(segments => segments.map(s => Object.assign({}, s, { speed: s.distance/s.elapsed_time })))
      .then(segments => this.setState(Object.assign({}, this.state, { segments, isFetchingSegments: false })));
  };
  render() {
    return (
      <div className="App">
        <Mapbox segments={this.state.segments} />
        <Router>
          <div>
            <div className="tabs" id="navcontainer">
              <ul id="navlist" className="tables">
                <li><Link to="/">Activities</Link></li>
                <li><Link to="/segments">Segments</Link></li>
              </ul>
            </div>
            <Route exact path="/" component={Activities} />
            <Route exact
                   path="/segments"
                   render={() => <Segments segments={this.state.segments} isFetching={this.state.isFetchingSegments}/>}
            />
          </div>
        </Router>
      </div>
    );
  }
}

const Map = ReactMapboxGl({
  accessToken: 'pk.eyJ1IjoibmljYmF0aGdhdGUiLCJhIjoiY2phOWYxcjQ3MGg2ZzMwcTlhamJ6Z21pMiJ9.kA5eVyN3PH56G-5u56-Q4A',
  center: [170.5000, -45.8758],
  zoom: 11,
  minZoom: 9,
  maxZoom: 24,
});

class Mapbox extends Component {
  componentDidMount() {
    // mapboxgl.accessToken = 'pk.eyJ1IjoibmljYmF0aGdhdGUiLCJhIjoiY2phOWYxcjQ3MGg2ZzMwcTlhamJ6Z21pMiJ9.kA5eVyN3PH56G-5u56-Q4A';
    // this.map = new mapboxgl.Map({
    //   container: this.mapContainer,
    //   style: 'mapbox://styles/mapbox/dark-v9',
    //   center: [170.5000, -45.8758],
    //   zoom: 11,
    //   minZoom: 9,
    //   maxZoom: 24,
    // });
    // this.map.addControl(new mapboxgl.NavigationControl());
    // Create a popup, but don't add it to the map yet.
    // this.popup = new mapboxgl.Popup({
    //   closeButton: false,
    //   closeOnClick: true
    // });
    // Create a geoJSON to put 'features' in
    // this.geojson = {
    //   type: 'FeatureCollection',
    //   features: [],
    // };
    // this.map.addLayer({
    //   "id": "segmentIcons",
    //   "type": "circle",
    //   "source": {
    //     type: 'vector',
    //     url: 'mapbox://examples.8fgz4egr'
    //   },
    // });
  }
  componentDidUpdate() {
/*    if(this.props.segments.length) {
      //this.props.segments.map(s => console.log(s.speed*15 + s.name));
      this.props.segments.map(s => {
        const latlong = polyline.decode(s.points).map(latlong => [latlong[1], latlong[0]]);
        const segmentPopup = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: true
        });
        segmentPopup
          .setLngLat(latlong[0])
          .setHTML(`<p>${s.name}</p>`)
          .addTo(this.map);
        this.geojson.features.push({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: latlong[0] },
          properties: { title: s.name, description: 'Description text here.' }
        });
        // create a HTML element for each feature
        const el = React.createElement('div', { class: 'marker'});
        // make a marker for the feature and add to the map
        // TODO: use react-mapbox-gl to do this
        // new mapboxgl.Marker(el)
        //   .setLngLat(latlong[0])
        //   .addTo(this.map);
        this.addSegmentLine(s.segment_id, s.speed, latlong);
      });
    }*/
  }
  //
  //   this.map.on('mouseenter', 'places', function(e) {
  //     // Change the cursor style as a UI indicator.
  //     this.map.getCanvas().style.cursor = 'pointer';
  //
  //     // Populate the popup and set its coordinates
  //     // based on the feature found.
  //     popup.setLngLat(latlong[0])
  //       .setHTML('test test')
  //       .addTo(this.map);
  //   });
  //
  //   this.map.on('mouseleave', 'places', function() {
  //     this.map.getCanvas().style.cursor = '';
  //     popup.remove();
  //   });
  // }
  addSegmentLine(name, speed, latlong) {
    if(this.map.getLayer(name)) return;
    this.map.addLayer({
      "id": name,
      "type": "line",
      "source": {
        "type": "geojson",
        "data": {
          "type": "Feature",
          "properties": {},
          "geometry": {
            "type": "LineString",
            "coordinates": latlong,
          }
        }
      },
      "layout": {
        "line-join": "round",
        "line-cap": "round"
      },
      "paint": {
        "line-color": hslToHex(speed*15, 100, 50),//"#ff7200",
        "line-width": 2,
        "line-opacity": 0.5,
      }
    });
  }
  componentWillUnmount() {
    // this.map.remove();
  }
  render() {
    const containerStyle = {
      position: 'relative',
      top: 0,
      bottom: 0,
      width: '100%',
      height: '400px',
    };
    const mapProps = {
      containerStyle,
      style: 'mapbox://styles/mapbox/dark-v9',
      center: [170.5000, -45.8758],
      zoom: [11],
      minZoom: 9,
      maxZoom: 24,
    };

    let renderedSegments = [];
    return <div>
      <Map {...mapProps}>
        {this.props.segments.map(s => {
          if(!renderedSegments.includes(s.id)) {
            renderedSegments.push(s.id);
            const latlong = polyline.decode(s.points).map(latlong => [latlong[1], latlong[0]]);
            const geojson = {
              "type": "Feature",
              "properties": {},
              "geometry": {
                "type": "LineString",
                "coordinates": latlong,
              }
            };
            return [
              <GeoJSONLayer
                data={geojson}
                linePaint={{
                  "line-color": hslToHex(s.speed*15, 100, 50),//"#ff7200",
                  "line-width": 2,
                  "line-opacity": 0.5,
                }}
                layerOptions={{
                  "line-join": "round",
                  "line-cap": "round"
                }}
              />,
              <Layer type="symbol" id={s.id} layout={{ "icon-image": "marker-15" }}>
               <Feature coordinates={latlong[0]}/>
              </Layer>
            ];
            // return <SegmentLayer key={s.name}
            //                      name={s.name}
            //                      latlong={polyline.decode(s.points).map(latlong => [latlong[1], latlong[0]])}/>
          }
        })}
      </Map>
    </div>;
    //return <div style={containerStyle} ref={el => this.mapContainer = el} />
    //return <div style={style} ref={el => this.mapContainer = el} />;
  }
}

class SegmentLayer extends Component {
  render() {
    return <Layer
      type="symbol"
      id={this.props.name}
      layout={{ "icon-image": "marker-15" }}>
      <Feature coordinates={this.props.latlong}/>
    </Layer>
  }
}


class Segments extends Component {
  state = {
    sort: 'name',
    order: 'ASC',
  };

  convertSpeedToPace(speed) {
    const total_seconds = 1000 / speed;
    const pace_seconds =
      (total_seconds % 60).toFixed(1) < 10 ? '0'+(total_seconds % 60).toFixed(1) : (total_seconds % 60).toFixed(1);
    return `${Math.floor(total_seconds/60)}:${pace_seconds}`;
  }
  sortSegments(field) {
    console.log(field, this.state.order);
    this.state.order === 'ASC' ? this.setState(Object.assign({}, this.state, { sort: field, order: 'DESC' }))
    : this.setState(Object.assign({}, this.state, { sort: field, order: 'ASC' }));
  }
  render() {
    if(this.props.isFetching) return(<Spinner />);

    let sorted_segments = _.sortBy(this.props.segments, (segment) => segment[this.state.sort]);
    if(this.state.order === 'DESC') sorted_segments = sorted_segments.reverse();
    return (
    <div className="segment-view">
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
      <div className="athlete-view">
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

function hslToHex(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  const toHex = x => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export default App;