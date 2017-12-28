import React, { Component } from 'react';
import Button from './Button';
import Autosuggest from 'react-autosuggest';
import * as _ from 'lodash';
import { inject, observer } from "mobx-react";


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
    this.setState(Object.assign({}, this.state, { athlete_id: e.target.dataset.athlete }));
  };
  selectClub = e => {
    this.setState(Object.assign({}, this.state, { club_id: e.target.value }));
  };
  filterSegmentsByAthlete = athlete_id => {
    !athlete_id ? this.fetchAllSegments() :
      this.props.store.fetchSegmentsByAthlete(athlete_id).then(() => this.props.store.updateReduxState());
  };
  filterSegmentsByClub = club_id => {
    !club_id ? this.fetchAllSegments() :
      this.props.store.fetchSegmentsByClub(club_id).then(() => this.props.store.updateReduxState());
  };
  fetchAllSegments = () => {
    this.props.store.fetchSegments().then(() => this.props.store.updateReduxState());
  };
  render() {
    const visibility = this.state.visible ? "show": "hide";
    const arrow = this.state.visible ? "◁" : "▷";
    const groups = _.groupBy(this.props.store.getSegments(), s => s.athlete_id);
    const sortedGroups = _.sortBy(Object.keys(groups)
      .map(athlete_id => ({ athlete_id, athlete_name: groups[athlete_id][0].athlete_name, segment_count: groups[athlete_id].length })), 'segment_count')
      .reverse()
      .slice(0, 20);

    return (
      <div id="filter-menu" className={visibility}>
        <div className="filter-menu-toggle-button-container" onClick={() => this.toggleMenu()}>
          <button className="filter-menu-toggle-button">{arrow}</button>
        </div>
        <div className="filter-menu-contents">

          {/*<h4>Athlete ID</h4>*/}
          {/*<input className="text" type="text" name="athlete_id" onChange={this.setAthleteId} />*/}
          {/*<Button buttonText='Filter'*/}
                  {/*onClick={this.props.filterSegmentsByAthlete}*/}
                  {/*onClickParams={this.state.athlete_id}*/}
          {/*/>*/}

          <h4>Athlete</h4>
          <AutoComplete athletes={this.props.store.athletes} onChange={this.setAthleteId} />
          <Button buttonText='Filter'
                  onClick={this.filterSegmentsByAthlete}
                  onClickParams={this.state.athlete_id}
          />

          <h4>Club</h4>
          <select className="text" onChange={this.selectClub}>
            <option value=''>Select a club...</option>
            {this.props.store.clubs.map(club =>
              <option key={club.id} value={club.id}>{club.name}</option>
            )}
          </select>
          <Button buttonText='Filter'
                  onClick={this.filterSegmentsByClub}
                  onClickParams={this.state.club_id}
          />

          <div className="leaderboard">
            <h3>Leaderboard</h3>
            <ul>
              {sortedGroups.map(athlete =>
                <li key={athlete.athlete_id}>
                  <span className="solo-icon"
                        title={`Hide all segments held by ${athlete.athlete_name}`}
                        onClick={() => this.props.store.hideAthlete(athlete.athlete_id)}
                  >
                    {this.props.store.hideAthleteId === athlete.athlete_id ? '◻ ' : '◼ '}
                  </span>
                  <span className="hide-icon"
                        title={`Show only segments held by ${athlete.athlete_name}`}
                        onClick={() => this.props.store.soloAthlete(athlete.athlete_id)}
                  >
                    {this.props.store.soloAthleteId === athlete.athlete_id ? '◉ ' : '◎ '}
                  </span>
                  <span className="athlete-name">{athlete.athlete_name}</span>
                  <span className="segment-count">{athlete.segment_count}</span>
                </li>
              )}
            </ul>
            <p><b>Total segments:</b> {this.props.store.getSegments().length}</p>
          </div>
        </div>
      </div>
    );
  }
}
export default inject("store")(observer(FilterMenu));


const AutoComplete = inject("store")(observer(class AutoComplete extends React.Component {
  constructor() {
    super();
    this.state = {
      value: '',
      suggestions: []
    };
  }
  escapeRegexCharacters = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  getSuggestions = value => {
    const escapedValue = this.escapeRegexCharacters(value.trim());
    if (escapedValue === '') return [];
    const regex = new RegExp('^' + escapedValue, 'i');
    // limit suggestions to 10
    return this.props.store.athletes.filter(athlete => regex.test(athlete.athlete_name)).slice(0, 10);
  };
  onChange = (event, { newValue, method }) => {
    this.setState({ value: newValue });
  };
  getSuggestionValue = suggestion => suggestion.athlete_name;
  renderSuggestion = athlete => {
    const profile_image = athlete.athlete_profile === 'avatar/athlete/large.png' ?
      'https://d3nn82uaxijpm6.cloudfront.net/assets/avatar/athlete/medium-989c4eb40a5532739884599ed662327c.png' :
      athlete.athlete_profile;
    return (<span className='athlete-suggestion'
          style={{'backgroundImage': `url("${profile_image}")`}}
    >
      <span className='name' data-athlete={athlete.athlete_id}>{athlete.athlete_name}</span>
    </span>
  )};

  onSuggestionsFetchRequested = ({ value }) => {
    this.setState({ suggestions: this.getSuggestions(value) });
  };

  onSuggestionsClearRequested = () => {
    this.setState({ suggestions: [] });
  };

  render() {
    const { value, suggestions } = this.state;
    const inputProps = {
      placeholder: "Type athlete name",
      value,
      onChange: this.onChange
    };

    return (
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
        getSuggestionValue={this.getSuggestionValue}
        renderSuggestion={this.renderSuggestion}
        onSuggestionSelected={(e) => this.props.onChange(e)}
        inputProps={inputProps}
      />
    );
  }
}));