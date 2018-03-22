import React, { Component } from 'react';
import { Marker, GeoJSONLayer } from "react-mapbox-gl";
import polyline from 'polyline';


class SegmentPolyline extends Component {
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
          "line-color": hslToHex(calcDifficulty(segment), 100, 50),//"#ff7200",
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
        {/*<div className="athlete-initials"><span>{segment.difficulty}</span></div>*/}
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

export default SegmentPolyline;

// Color segment line by difficulty
function calcDifficulty(segment) {
  //console.log(segment.speed*15, segment.distance/50, segment.avg_grade*8);
  return segment.speed*15;
}

// Used to color the segment lines
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