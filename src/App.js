import React, { Component } from 'react';
import { BrowserRouter as Router, Link, Route } from 'react-router-dom';
import './App.css';
import Map from './Components/Map';
import SegmentTable from './Components/SegmentTable';
import ActivityTable from './Components/ActivityTable';


class App extends Component {
  state = {
    segments: [],
    isFetchingSegments: true,
  };

  componentDidMount() {
    //-45.911756,170.495793,-45.888165,170.535169
    const { a_lat, a_long, b_lat, b_long } =
      { a_lat: -45.9100, a_long: 170.4544, b_lat: -45.8423, b_long: 170.5676 };
    fetch(`/segments/explore/${a_lat}/${a_long}/${b_lat}/${b_long}`)
      .then(res => res.json())
      .then(segments => segments.map(s =>
        Object.assign({}, s, { speed: s.distance/s.elapsed_time, effort_speed: s.effort_distance/s.elapsed_time })))
      .then(segments => this.setState(Object.assign({}, this.state, { segments, isFetchingSegments: false })));
  };
  updateSegmentLeaderboard(e, id) {
    e.preventDefault();
    fetch(`/segments/${id}/updateleaderboard`)
      .then(res => res.json())
      .then(efforts => console.log(efforts[0]));
  }
  render() {
    return (
      <div className="App">
        <Map segments={this.state.segments} updateSegmentLeaderboard={this.updateSegmentLeaderboard} />
        <Router>
          <div>
            <div className="tabs" id="navcontainer">
              <ul id="navlist" className="tables">
                <li><Link to="/">Activities</Link></li>
                <li><Link to="/segments">Segments</Link></li>
              </ul>
            </div>
            <Route exact path="/" component={ActivityTable} />
            <Route exact
                   path="/segments"
                   render={() =>
                     <SegmentTable segments={this.state.segments} isFetching={this.state.isFetchingSegments}/>}
            />
          </div>
        </Router>
      </div>
    );
  }
}

export default App;