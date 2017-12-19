import { combineReducers } from 'redux';
//import { createSelector } from 'reselect';
import {
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

const rootReducer = combineReducers({
  segments,
  athleteSegments,
});
export default rootReducer;


/*
 * SELECTORS
*/

export const getSegments = state => state.segments;
export const getAthleteSegments = state => state.athleteSegments;