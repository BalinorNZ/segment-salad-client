import { combineReducers } from 'redux';
//import { createSelector } from 'reselect';
import {
  REQUEST_SEGMENTS,
  RECEIVE_SEGMENTS,
  RECEIVE_ATHLETE_SEGMENTS,
} from '../Actions/actions';


const segments = (state = [], action) => {
  switch(action.type) {
    case RECEIVE_SEGMENTS:
      return action.segments;
    default:
      return state;
  }
};

const athleteSegments = (state = [], action) => {
  switch(action.type) {
    case RECEIVE_ATHLETE_SEGMENTS:
      return action.segments;
    default:
      return state;
  }
};

const fetchingSegments = (state = false, action) => {
  switch(action.type) {
    case REQUEST_SEGMENTS:
      return true;
    case RECEIVE_SEGMENTS:
      return false;
    default:
      return state;
  }
};

const rootReducer = combineReducers({
  segments,
  athleteSegments,
  fetchingSegments,
});
export default rootReducer;


/*
 * SELECTORS
*/

export const getSegments = state => state.segments.map(s =>
  Object.assign({}, s, {
    segment_id: s.id,
    speed: s.distance/s.elapsed_time,
    effort_speed: s.effort_distance/s.elapsed_time
  })
);
export const getAthleteSegments = state => state.athleteSegments;
export const isFetchingSegments = state => state.fetchingSegments;