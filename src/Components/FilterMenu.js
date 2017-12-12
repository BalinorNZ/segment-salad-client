import React, { Component } from 'react';
import Button from './Button';
import * as _ from 'lodash';


class FilterMenu extends Component {
  state = {
    visible: true,
    athlete_id: '',
    club_id: '',
  };
  toggleMenu = () => {
    this.setState({ visible: !this.state.visible });
  };
  setAthleteId = e => {
    this.setState(Object.assign({}, this.state, { athlete_id: e.target.value }));
  };
  selectClub = e => {
    this.setState(Object.assign({}, this.state, { club_id: e.target.value }));
  };
  render() {
    const visibility = this.state.visible ? "show": "hide";
    const arrow = this.state.visible ? "◁" : "▷";
    const groups = _.groupBy(this.props.segments, s => s.athlete_name);
    const sortedGroups = _.sortBy(Object.keys(groups)
      .map(athlete => ({ athlete, segment_count: groups[athlete].length })), 'segment_count')
      .reverse()
      .slice(0, 20);

    return (
      <div id="filter-menu" className={visibility}>
        <div className="filter-menu-toggle-button-container" onClick={() => this.toggleMenu()}>
          <button className="filter-menu-toggle-button">{arrow}</button>
        </div>
        <div className="filter-menu-contents">

          <h4>Athlete ID</h4>
          <input className="text" type="text" name="athlete_id" onChange={this.setAthleteId} />
          <Button buttonText='Filter'
                  onClick={this.props.filterSegmentsByAthlete}
                  onClickParams={this.state.athlete_id}
          />

          <h4>Club</h4>
          <select className="text"onChange={this.selectClub}>
            <option value=''>Select a club...</option>
            {this.props.clubs.map(club =>
              <option key={club.id} value={club.id}>{club.name}</option>
            )}
          </select>
          <Button buttonText='Filter'
                  onClick={this.props.filterSegmentsByClub}
                  onClickParams={this.state.club_id}
          />

          <div className="leaderboard">
            <h3>Leaderboard</h3>
            <ul>
              {sortedGroups.map(athlete =>
                <li key={athlete.athlete}>
                  <span className="athlete-name">{athlete.athlete}:</span>
                  <span className="segment-count">{athlete.segment_count}</span>
                </li>
              )}
            </ul>
            <p><b>Total segments:</b> {this.props.segments.length}</p>
          </div>
        </div>
      </div>
    );
  }
}

export default FilterMenu;