import { call, put, takeLatest } from 'redux-saga/effects';
import { REQUEST_SEGMENTS, RECEIVE_SEGMENTS } from './Actions/actions';
const api = url => fetch(url).then(res => res.json());

function* fetchSections(action) {
  try {
    const segments = yield call(api, `/segments`);
    yield put({ type: RECEIVE_SEGMENTS, segments });
  } catch (e) {
    console.log(e);
  }
}

function* fetchSectionsSaga() {
  yield takeLatest(REQUEST_SEGMENTS, fetchSections);
}

export default fetchSectionsSaga;