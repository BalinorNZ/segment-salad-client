import React, { Component } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import ReactMapboxGl, { Layer, Feature, Source, GeoJSONLayer  } from "react-mapbox-gl";
import polyline from 'polyline';

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
              />
            ];
            //   <Layer type="symbol" id={s.id} layout={{ "icon-image": "marker-15" }}>
            //     <Feature coordinates={latlong[0]}/>
            //   </Layer>
          }
        })}
      </Map>
    </div>;
  }
}

export default Mapbox;

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