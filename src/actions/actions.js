export const ADD_SEGMENT = "ADD_SEGMENT";
export const addSegment = segment => ({ type: ADD_SEGMENT, segment });

export const FETCH_SEGMENTS = "FETCH_SEGMENTS";

export const REQUEST_SEGMENTS = 'REQUEST_SEGMENTS';
export const requestSegments = () => ({ type: REQUEST_SEGMENTS });

export const RECEIVE_SEGMENTS = 'RECEIVE_SEGMENTS';
export const receiveSegments = (segments) => ({ type: RECEIVE_SEGMENTS, segments });

export const RECEIVE_ATHLETE_SEGMENTS = 'RECEIVE_ATHLETE_SEGMENTS';
export const receiveAthleteSegments = (segments) => ({ type: RECEIVE_ATHLETE_SEGMENTS, segments });