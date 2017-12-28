import React, { Component } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import ReactMapboxGl, { ZoomControl, ScaleControl, RotationControl } from "react-mapbox-gl";
//import polyline from 'polyline';
import SegmentPolyline from './SegmentPolyline';
import SegmentPopup from "./SegmentPopup";
import * as _ from 'lodash';
import { inject, observer } from "mobx-react"


const Map = ReactMapboxGl({
  accessToken: 'pk.eyJ1IjoibmljYmF0aGdhdGUiLCJhIjoiY2phOWYxcjQ3MGg2ZzMwcTlhamJ6Z21pMiJ9.kA5eVyN3PH56G-5u56-Q4A',
});

class Mapbox extends Component {
  state = {
    popup: undefined,
    bounds: [],
  };
  componentWillMount() {
    this.mapProps = {
      className: 'mapboxgl-container-style',
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

  render() {
    // Generate geojson feature collection which can be input into geojson-vt to make vector tiles
    // const geojson = {
    //   "type": "FeatureCollection",
    //   "features": this.props.segments.map(segment => (
    //     {
    //       "type": "Feature",
    //       "properties": { "name": segment.name },
    //       "geometry": {"type": "LineString", "coordinates": polyline.decode(segment.points).map(latlong => [latlong[1], latlong[0]])}
    //     }
    //   )),
    // };
    //console.log(JSON.stringify(geojson));

    return <Map {...this.mapProps}>
      <button className="scanButton btn" onClick={e => this.scanSegmentsClick(e)}>Scan for segments</button>
      <ZoomControl />
      <ScaleControl />
      <RotationControl />
      {this.state.popup &&
        <SegmentPopup coords={this.state.popup.coordinates}
                      segment={this.state.popup.segment}
                      currentAthleteEffort={_.find(this.props.store.athleteSegments, s => s.id === this.state.popup.segment.id)}
        />
      }
      {this.props.segments.slice(0, 1000).map(segment =>
        <SegmentPolyline key={`line-${segment.activity_id}-${segment.id}`}
                     id={`${segment.activity_id}-${segment.id}`}
                     segment={segment}
                     onClickLine={this.onClickLine}
                     unsetPopup={this.handleMapClick}
        />)
      }
    </Map>;
  }
};
export default inject("store")(observer(Mapbox));