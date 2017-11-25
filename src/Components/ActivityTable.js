import React, { Component } from 'react';
import moment from 'moment';
import * as _ from 'lodash';
import Spinner from './Spinner';
import Zones from './Zones';
import Pagination from './Pagination';


class ActivityTable extends Component {
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

export default ActivityTable;