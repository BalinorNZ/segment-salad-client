import React, { Component } from 'react';


class Pagination extends Component {
  state = { athlete: {} };

  componentDidMount() {
    this.getAthlete(4734138);
  }
  getAthlete(id) {
    fetch(`/athletes/${id}/stats`)
      .then(res => res.json())
      .then(athlete => this.setState({ athlete }));
  }
  render() {
    if(!this.state.athlete.all_ride_totals
      || !this.state.athlete.all_run_totals
      || !this.state.athlete.all_swim_totals) return (<ul></ul>);
    const activity_total = this.state.athlete.all_ride_totals.count + this.state.athlete.all_run_totals.count + this.state.athlete.all_swim_totals.count;
    let pages = [...Array(Math.ceil(activity_total/50)).keys()];
    return (
      <ul className="zones">{pages.map(p => <li key={p} onClick={this.props.getActivities}><a href="#">{p+1}</a></li>)}</ul>
    );
  }
}

export default Pagination;