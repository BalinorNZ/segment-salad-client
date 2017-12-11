import React, { Component } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import ReactMapboxGl, { Layer, Feature, Marker, Popup, GeoJSONLayer, ZoomControl, ScaleControl, RotationControl } from "react-mapbox-gl";
import polyline from 'polyline';
import * as _ from 'lodash';


const Map = ReactMapboxGl({
  accessToken: 'pk.eyJ1IjoibmljYmF0aGdhdGUiLCJhIjoiY2phOWYxcjQ3MGg2ZzMwcTlhamJ6Z21pMiJ9.kA5eVyN3PH56G-5u56-Q4A',
});

class Mapbox extends Component {
  state = {
    popup: undefined,
    bounds: [],
  };
  componentWillMount() {
    const containerStyle = {
      position: 'relative',
      top: 0,
      bottom: 0,
      width: '100%',
      height: '600px',
    };
    this.mapProps = {
      containerStyle,
      style: 'mapbox://styles/mapbox/dark-v9',
      center: [170.5000, -45.8758],
      zoom: [12],
      minZoom: 9,
      maxZoom: 24,
      cursor: 'pointer',
      onClick: (e) => this.handleMapClick(e),
    };
  }
  handleMapClick = (e) => {
    this.setState(Object.assign({}, this.state, { bounds: e.getBounds(), popup: undefined }));
  };
  onClickLine = (coordinates, segment) => {
    this.setState({ popup: { coordinates, segment }});
  };
  scanSegmentsClick = e => {
    console.log(this.state.bounds);
    if(!this.state.bounds) return;
    const bounds = this.state.bounds;
    fetch(`/segments/explore/${bounds._sw.lat}/${bounds._sw.lng}/${bounds._ne.lat}/${bounds._ne.lng}`)
      .then(res => res.json())
      .then(segments => segments.map(s =>
        Object.assign({}, s, { segment_id: s.id, speed: s.distance/s.elapsed_time, effort_speed: s.effort_distance/s.elapsed_time })))
      .then(segments => this.setState(Object.assign({}, this.state, { segments, isFetchingSegments: false })));
  };

  // TODO: Add filtering, make it also filter table below the map
  // TODO: add segment filters/search to map (below x elevation/pace/distance etc)
  // TODO: Cluster markers when zoomed out
  // TODO: turn segment GeoJSON lines into a tileset for better render performance
  render() {
    // Generate geojson feature collection which can be input into geojson-vt to make vector tiles
    const geojson = {
      "type": "FeatureCollection",
      "features": this.props.segments.map(segment => (
        {
          "type": "Feature",
          "properties": { "name": segment.name },
          "geometry": {"type": "LineString", "coordinates": polyline.decode(segment.points).map(latlong => [latlong[1], latlong[0]])}
        }
      )),
    };
    //console.log(JSON.stringify(geojson));

    return <Map {...this.mapProps}>
      <button className="scanButton btn" onClick={e => this.scanSegmentsClick(e)}>Scan for segments</button>
      <ZoomControl />
      <ScaleControl />
      <RotationControl />
      {this.state.popup &&
        <Popup coordinates={this.state.popup.coordinates}
               anchor={'bottom'}
               offset={0}
               closeButton={true}
               closeOnClick={true}
        >
          <PopupContent segment={this.state.popup.segment}
                        currentAthleteEffort={_.find(this.props.athleteSegments, s => s.id === this.state.popup.segment.id)}
                        updateSegmentLeaderboard={this.props.updateSegmentLeaderboard}
          />
        </Popup>
      }
      {this.props.segments.slice(0, 1000).map(segment =>
        <SegmentLine key={`line-${segment.activity_id}-${segment.id}`}
                     id={`${segment.activity_id}-${segment.id}`}
                     segment={segment}
                     onClickLine={this.onClickLine}
                     unsetPopup={this.handleMapClick}
        />)
      }
    </Map>;
  }
}
export default Mapbox;

class SegmentLine extends Component {
  state = {
    lineOpacity: 0.5,
    lineWidth: 2,
    endPoint: undefined,
    startMarkerClass: 'startMarker',
  };
  onMarkerClick(coord, segment) {
    this.props.onClickLine(coord, segment);
  }
  onMarkerHover(endPoint) {
    this.setState({ lineOpacity: 1, lineWidth: 3, endPoint, startMarkerClass: 'startMarkerHover' });
  }
  onMarkerLeave() {
    this.setState({ lineOpacity: 0.5, lineWidth: 2, endPoint: undefined, startMarkerClass: 'startMarker' });
  }
  onToggleHover(e, pointer) {
    e.target.getCanvas().style.cursor = pointer;
  };
  getInitials(name) {
    if(!name) return "--";
    return name.split(" ").map(part => part.charAt(0).toUpperCase()).join('').slice(0, 2);
  }
  render() {
    const { id, segment } = this.props;
    const latlong = polyline.decode(segment.points).map(latlong => [latlong[1], latlong[0]]);
    const geojson = {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "LineString",
        "coordinates": latlong,
      }
    };
    const markerStyle = {
      backgroundImage: `url("${segment.athlete_profile}")`,
    };

    return <div>
      <GeoJSONLayer
        key={id}
        data={geojson}
        linePaint={{
          "line-color": hslToHex(segment.speed*15, 100, 50),//"#ff7200",
          "line-width": this.state.lineWidth,
          "line-opacity": this.state.lineOpacity,
        }}
        lineLayout={{
          "line-join": "round",
          "line-cap": "round",
        }}
        // lineOnMouseEnter={(e) => this.onToggleHover(e, 'pointer')}
        // lineOnMouseLeave={(e) => this.onToggleHover(e, '')}
        // lineOnClick={() => this.props.onClickLine(latlong[0], segment)}
      />
      <Marker key={`marker-${segment.activity_id}-${segment.id}`}
              style={markerStyle}
              className={this.state.startMarkerClass}
              coordinates={latlong[0]}
              onClick={() => this.onMarkerClick(latlong[0], segment)}
              onMouseEnter={() => this.onMarkerHover(latlong[latlong.length-1])}
              onMouseLeave={() => this.onMarkerLeave()}
      >
        <div className="athlete-initials"><span>{this.getInitials(segment.athlete_name)}</span></div>
      </Marker>
      {this.state.endPoint &&
      <Marker key={`end-${segment.activity_id}-${segment.id}`}
              className="endMarker"
              coordinates={this.state.endPoint}
      >
      </Marker>
      }
    </div>;
  }
}

// const clusterMarker = (coordinates, pointCount, getLeaves) =>
//   (Array) => (
//   <Marker
//     key={coordinates.toString()}
//     coordinates={coordinates}
//     style={styles.clusterMarker}
//     onClick={this.clusterClick.bind(this, coordinates, pointCount, getLeaves)}
//   >
//     <div>{pointCount}</div>
//   </Marker>
// );
// TODO: send current athlete effort data to popup for comparison with CR (generate percentile)
const PopupContent = ({segment, updateSegmentLeaderboard, currentAthleteEffort}) => (
  <div className="popup-content-wrapper">
    <div className="segment-info-popup segment-info-box">
      <div className="info-box-header">
        <h1>{segment.name}</h1>
        <h3>CR: <a href={`https://strava.com/athletes/${segment.athlete_id}`} target="_blank">{segment.athlete_name}</a></h3>
      </div>
      <div className="clear"></div>
      <div className="general-info">
        <div className="stat">
          <strong>{formatDistance(segment.distance)}</strong>
          <br />
          <span className="label">Distance</span>
        </div>
        <div className="stat">
          <strong>{segment.avg_grade}%</strong>
          <br />
          <span className="label">Grade</span>
        </div>
        <div className="stat">
          <strong>{segment.elev_difference} m</strong>
          <br />
          <span className="label">Elev Gain</span>
        </div>
        <div className="spacer stat">
          <strong>{convertSpeedToPace(segment.speed)}/km</strong>
          <br />
          <span className="label">Pace</span>
        </div>
        <div className="stat">
          {segment.entry_count}
          <br />
          <span className="label">Athletes</span>
        </div>
        <div className="clear"></div>
        <div className="records">
          <div className="avatar avatar-athlete avatar-md">
            <img src={segment.athlete_profile} />
          </div>
          <div className="record-stat">
            <strong>CR: </strong>
            <a href={`https://strava.com/segment_efforts/${segment.effort_id}`} target="_blank">
              {secondsToHms(segment.elapsed_time)}
            </a>
            <span> ({formatDistance(segment.effort_distance)} @ {convertSpeedToPace(segment.effort_speed)}/km)</span>
          </div>
          {currentAthleteEffort ?
          <div className="record-stat">
            <strong>PB: </strong>
            <a href={`https://strava.com/segment_efforts/${currentAthleteEffort.effort_id}`} target="_blank">
              <span className=""> {secondsToHms(currentAthleteEffort.elapsed_time)} </span>
            </a>
            <span className=".segment-PB-negative"> ({formatDistance(currentAthleteEffort.effort_distance)}
              {'\u00A0'}@ {convertSpeedToPace(currentAthleteEffort.effort_speed)}/km)</span>
          </div>
            : <div className="record-stat"><strong>PB: </strong>Segment not attempted yet.</div>}
        </div>
        <div className="clear"></div>
      </div>
      <div className="details-link explorer-performance-goals-beta">
        <a className="alt button create-goal"
           onClick={(e) => updateSegmentLeaderboard(e, segment.segment_id)}
        >
          Update
        </a>
        <a className="alt button" target="_blank" href={`https://strava.com/segments/${segment.segment_id}`}>
          View Segment
        </a>
        <div className="clear"></div>
      </div>
    </div>
  </div>
);
function formatDistance(d) {
  if(!d) return 0;
  return d < 1000 ? d.toFixed(1) + 'm' : (d/1000).toFixed(2) + 'km';
}
function secondsToHms(d) {
  d = Number(d);
  const h = Math.floor(d / 3600);
  const m = Math.floor(d % 3600 / 60);
  const s = Math.floor(d % 3600 % 60);
  return h > 0 ? ('0' + h).slice(-2) + ":" + ('0' + m).slice(-2) + ":" + ('0' + s).slice(-2)
    : ('0' + m).slice(-2) + ":" + ('0' + s).slice(-2);
}
function convertSpeedToPace(speed) {
  if(!speed) return '0:00';
  const total_seconds = 1000 / speed;
  const pace_seconds =
    (total_seconds % 60).toFixed(1) < 9.5 ? '0'+(total_seconds % 60).toFixed(0) : (total_seconds % 60).toFixed(0);
  return `${Math.floor(total_seconds/60)}:${pace_seconds}`;
}

// componentDidUpdate() {
//   if(this.props.segments.length) {
//     //this.props.segments.map(s => console.log(s.speed*15 + s.name));
//     this.props.segments.map(s => {
//       const latlong = polyline.decode(s.points).map(latlong => [latlong[1], latlong[0]]);
//       const segmentPopup = new mapboxgl.Popup({
//         closeButton: false,
//         closeOnClick: true
//       });
//       segmentPopup
//         .setLngLat(latlong[0])
//         .setHTML(`<p>${s.name}</p>`)
//         .addTo(this.map);
//       this.geojson.features.push({
//         type: 'Feature',
//         geometry: { type: 'Point', coordinates: latlong[0] },
//         properties: { title: s.name, description: 'Description text here.' }
//       });
//       // create a HTML element for each feature
//       const el = React.createElement('div', { class: 'marker'});
//       // make a marker for the feature and add to the map
//       new mapboxgl.Marker(el)
//         .setLngLat(latlong[0])
//         .addTo(this.map);
//       this.addSegmentLine(s.segment_id, s.speed, latlong);
//     });
//   }
// }
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