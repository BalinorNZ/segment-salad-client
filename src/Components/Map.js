import React, { Component } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import ReactMapboxGl, { Layer, Feature, Popup, GeoJSONLayer, ZoomControl, ScaleControl, RotationControl } from "react-mapbox-gl";
import polyline from 'polyline';

const Map = ReactMapboxGl({
  accessToken: 'pk.eyJ1IjoibmljYmF0aGdhdGUiLCJhIjoiY2phOWYxcjQ3MGg2ZzMwcTlhamJ6Z21pMiJ9.kA5eVyN3PH56G-5u56-Q4A',
  center: [170.5000, -45.8758],
  zoom: 11,
  minZoom: 9,
  maxZoom: 24,
});

class Mapbox extends Component {
  state = {
    popup: undefined,
  };
  componentWillMount() {
    const containerStyle = {
      position: 'relative',
      top: 0,
      bottom: 0,
      width: '100%',
      height: '400px',
    };
    this.mapProps = {
      containerStyle,
      style: 'mapbox://styles/mapbox/dark-v9',
      center: [170.5000, -45.8758],
      zoom: [11],
      minZoom: 9,
      maxZoom: 24,
      cursor: 'pointer',
      onClick: () => this.unsetPopup(),
    };
  }
  unsetPopup = () => {
    this.setState({ popup: undefined });
  };
  onClickLine = (coordinates, segment) => {
    this.setState({ popup: { coordinates, segment }});
  };
  render() {
    return <Map {...this.mapProps}>
        <ZoomControl />
        <ScaleControl />
        <RotationControl />
        {this.state.popup &&
          <Popup coordinates={this.state.popup.coordinates}
                 anchor={'bottom'}
                 offset={0}
                 closeButton={true}
                 closeOnClick={true}>
            <b>{this.state.popup.segment.name}</b>
            <p>CR: {this.state.popup.segment.athlete_name}</p>
            <p>Total athletes: {this.state.popup.segment.entry_count}</p>
          </Popup>
        }
        {this.props.segments.slice(0, 100).map(segment =>
          <SegmentLine key={`${segment.activity_id}-${segment.id}`}
                       id={`${segment.activity_id}-${segment.id}`}
                       segment={segment}
                       onClickLine={this.onClickLine}
                       unsetPopup={this.unsetPopup}
          />)
        }
      </Map>;
  }
}

class SegmentLine extends Component {
  onToggleHover(e, pointer) {
    console.log(e);
    e.target.getCanvas().style.cursor = pointer;
  };
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
    return [
      <GeoJSONLayer
        key={id}
        data={geojson}
        linePaint={{
          "line-color": hslToHex(segment.speed*15, 100, 50),//"#ff7200",
          "line-width": 2,
          "line-opacity": 0.5,
        }}
        lineLayout={{
          "line-join": "round",
          "line-cap": "round",
        }}
        lineOnMouseEnter={(e) => this.onToggleHover(e, 'pointer')}
        lineOnMouseLeave={(e) => this.onToggleHover(e, '')}
        lineOnClick={() => this.props.onClickLine(latlong[0], segment)}
      />,
      //   <Layer type="symbol" id={segment.id} layout={{ "icon-image": "marker-15" }}>
      //     <Feature coordinates={latlong[0]}/>
      //   </Layer>
    ];
  }
};

export default Mapbox;

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