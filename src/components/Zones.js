import React, { Component } from 'react';


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

export default Zones;