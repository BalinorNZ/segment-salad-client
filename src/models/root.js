import { ADD_SEGMENT, FETCH_SEGMENTS } from "../actions/actions"
import { types, flow } from "mobx-state-tree";
import Segment from "./segment";
import Athlete from "./athlete";
import Club from "./club";


const Store = types
  .model({
    //TODO: current_athlete_id should be set dynamically after authenticating with Strava
    current_athlete_id: 4734138,
    segments: types.optional(types.array(Segment), []),
    athleteSegments: types.optional(types.array(Segment), []),
    clubs: types.optional(types.array(Club), []),
    athletes: types.optional(types.array(Athlete), []),
    isFetching: false,
  })
  .views(self => ({
    // utilities
    findSegmentById: function(id) {
      return self.segments.find(s => s.id === id)
    },
    getSegments: function() {
      return self.segments;
    }
  }))
  .actions(self => ({
    // actions
    fetchClubs: flow(function* fetchClubs(){
      try {
        self.clubs = yield fetch(`/list_clubs`).then(res => res.json());
      } catch(e) {
        console.log(e);
      }
    }),
    fetchAthletes: flow(function* fetchAthletes(){
      try {
        self.athletes = yield fetch(`/athletes`).then(res => res.json());
      } catch(e) {
        console.log(e);
      }
    }),
    fetchSegments: flow(function* fetchSegments() {
      self.isFetching = true;
      try {
        self.segments = yield fetch(`/segments`).then(res => res.json());
        self.isFetching = false;
      } catch(e) {
        console.log(e);
      }
    }),
    fetchAthleteSegments: flow(function* fetchAthleteSegments() {
      try {
        self.athleteSegments = yield fetch(`/athletes/${self.current_athlete_id}/segments`)
          .then(res => res.json());
      } catch(e) {
        console.log(e);
      }
    }),
    fetchSegmentsByAthlete: flow(function* fetchSegmentsByAthlete(athlete_id) {
      try {
        self.segments.clear();
        self.segments = yield fetch(`/athletes/${athlete_id}/segments`).then(res => res.json());
      } catch(e) {
        console.log(e);
      }
    }),
    fetchSegmentsByClub: flow(function* fetchSegmentsByClub(club_id) {
      try {
        self.segments.clear();
        self.segments = yield fetch(`/clubs/${club_id}/segments`).then(res => res.json());
      } catch(e) {
        console.log(e);
      }
    }),
    // [ADD_SEGMENT]({ segment_name }) {
    //   const id = self.segments.reduce((maxId, segment) => Math.max(segment.id, maxId), -1) + 1
    //   self.segments.unshift({
    //     id,
    //     segment_name
    //   })
    // },
    // [FETCH_SEGMENTS]: function* () {
    //   try {
    //     const segments = yield fetch(`/segments`).then(res => res.json());
    //     self.segments.concat(segments);
    //   } catch (e) {
    //     console.log(e);
    //   }
    // },
  }));

export default Store;