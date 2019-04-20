import React, { Component } from 'react';
import moment from 'moment';
import Spinner from './Spinner';
import Pagination from './Pagination';
import { observer, inject } from "mobx-react";


class AthleteSegmentsTable extends Component {
  state = { athleteSegments: [], isFetching: true };

  componentDidMount() {
    this.getAthleteSegments();
  }
  getAthleteSegments() {
    fetch(`/athletesegments`)
      .then(res => res.json())
      //.then(json => json.message === 'Rate Limit Exceeded' ? Promise.reject() : json)
      .then(athleteSegments => this.setState({ athleteSegments, isFetching: false }));
  }
  handleClick(e) {
    e.preventDefault();
    this.getAthleteSegments(parseInt(e.target.innerHTML, 10));
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
    const adjustedHR = (hr-45)/(190-45)*100;
    return (adjustedHR/speed).toFixed(0);
  }
  render() {
    if(this.state.isFetching) return(<Spinner />);

    return (
      <div className="athlete-view">
        <Pagination athlete={this.props.store.currentAthleteId} getActivities={this.handleClick.bind(this)} />
        <table>
          <thead>
          <tr><th>Segment</th><th>Grade</th><th>Cadence</th><th>Effort Dist</th><th>Segment Dist</th><th>Time</th><th>Pace</th><th>HR</th><th>Fitness</th><th>Rank</th></tr>
          </thead>
          <tbody>
          {this.state.athleteSegments
            .map(effort =>
              <tr key={effort.id}>
                <td title={effort.activity.id}>{effort.segment.name}</td>
                <td>{effort.segment.average_grade}%</td>
                <td>{effort.average_cadence*2}</td>
                <td>{(effort.distance/1000).toFixed(2)} km</td>
                <td>{(effort.segment.distance/1000).toFixed(2)} km</td>
                <td>{moment.utc(effort.moving_time*1000).format('HH:mm:ss')}</td>
                <td>{this.convertSpeedToPace(effort.distance / effort.moving_time)}/km</td>
                <td>{effort.average_heartrate ? effort.average_heartrate.toFixed(1) : '000.0'} bpm</td>
                <td>{this.calculateFitness((effort.distance / effort.moving_time), effort.average_heartrate)}</td>
                <td>{effort.kom_rank} |  {effort.pr_rank}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }
}

export default inject("store")(observer(AthleteSegmentsTable));