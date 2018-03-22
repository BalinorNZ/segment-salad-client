import { types, flow } from "mobx-state-tree";
import Segment from "./segment";
import Athlete from "./athlete";
import Club from "./club";


const Store = types
  .model({
    //TODO: current_athlete_id should be set dynamically after authenticating with Strava
    currentAthleteId: 4734138,
    segments: types.optional(types.array(Segment), []),
    athleteSegments: types.optional(types.array(Segment), []),
    clubs: types.optional(types.array(Club), []),
    athletes: types.optional(types.array(Athlete), []),
    isFetchingSegments: false,
    soloAthleteId: types.maybe(types.string),
    hideAthleteId: types.maybe(types.string),
    bounds_sw: types.maybe(types.model({ lng: types.number, lat: types.number })),
    bounds_ne: types.maybe(types.model({ lng: types.number, lat: types.number })),
  })
  .views(self => ({
    // utilities
    findSegmentById: (id) => self.segments.find(s => s.id === id),
    getSegments: () => self.segments.filter(s => s.entry_count >= 5),
    getFilteredSegments: () => self.getSegments()
        .slice(0, 1000)
        .filter(s => self.soloAthleteId ? s.athlete_id === self.soloAthleteId : true)
        .filter(s => self.hideAthleteId ? s.athlete_id !== self.hideAthleteId : true)
        .filter(s => {
          if(!self.bounds_sw || !self.bounds_ne) return true;
          // console.log(s.start_latlng.x, self.bounds_sw.lat);
          // console.log(s.start_latlng.x, self.bounds_ne.lat);
          // console.log(s.start_latlng.y, self.bounds_ne.lng);
          // console.log(s.start_latlng.y, self.bounds_sw.lng);
          if(s.start_latlng.x > self.bounds_sw.lat
          && s.start_latlng.x < self.bounds_ne.lat
          && s.start_latlng.y < self.bounds_ne.lng
          && s.start_latlng.y > self.bounds_sw.lng)
            return true;
          if(s.end_latlng.x < self.bounds_sw.lat
            && s.end_latlng.x > self.bounds_ne.lat
            && s.end_latlng.y < self.bounds_ne.lng
            && s.end_latlng.y > self.bounds_sw.lng)
            return true;
          return false;
        }),
  }))
  .actions(self => ({
    // actions
    setBounds(bounds) {
      self.bounds_sw = { lng: bounds._sw.lng, lat: bounds._sw.lat };
      self.bounds_ne = { lng: bounds._ne.lng, lat: bounds._ne.lat };
    },
    soloAthlete(athlete_id) { self.soloAthleteId = athlete_id === self.soloAthleteId ? undefined : athlete_id },
    hideAthlete(athlete_id) { self.hideAthleteId = athlete_id === self.hideAthleteId ? undefined : athlete_id },
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
      self.isFetchingSegments = true;
      try {
        self.segments = yield fetch(`/segments`).then(res => res.json());
        self.isFetchingSegments = false;
      } catch(e) {
        console.log(e);
      }
    }),
    fetchAthleteSegments: flow(function* fetchAthleteSegments() {
      try {
        self.athleteSegments = yield fetch(`/athletes/${self.currentAthleteId}/segments`)
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
    updateSegmentLeaderboard: flow(function* updateSegmentLeaderboard(id) {
      try {
        yield fetch(`/segments/${id}/updateleaderboard`).then(res => res.json());
      } catch(e) {
        console.log(e);
      }
    }),
    updateReduxState() {},
  }));

export default Store;