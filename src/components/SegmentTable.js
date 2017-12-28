import React, { Component } from 'react';
import moment from 'moment';
import * as _ from 'lodash';
import Spinner from './Spinner';
import { inject, observer } from "mobx-react";


class SegmentTable extends Component {
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
    if(this.props.store.isFetchingSegments) return(<Spinner />);

    let sorted_segments = _.sortBy(this.props.store.getFilteredSegments(), (segment) => segment[this.state.sort]);
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
            <th className="date">Date</th>
          </tr>
          </thead>
          <tbody>
          {sorted_segments && sorted_segments.map((s, index) =>
            <tr key={s.id+s.activity_id} id={s.id}>
              <td>{index+1}</td>
              <td className="segment-name">{s.name}</td>
              <td>{s.avg_grade}</td>
              <td>{s.elev_difference}</td>
              <td>{s.entry_count ? s.entry_count : ''}</td>
              <td className="athlete-name">{s.athlete_name}</td>
              <td>{this.convertSpeedToPace(s.speed)}</td>
              <td>{s.average_hr}</td>
              <td>{s.distance}</td>
              <td>{s.elapsed_time}</td>
              <td>{s.moving_time}</td>
              <td>{s.rank}</td>
              <td>{moment(s.start_date_local).format("D MMM YYYY")}</td>
            </tr>
          )}
          </tbody>
        </table>
      </div>
    );
  }
};

export default inject("store")(observer(SegmentTable));