import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import rootReducer from './Reducers/reducers';
import fetchSectionsSaga from './sagas';


export default(initialState) => {
  const persistedState = window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__();
  const sagaMiddleware = createSagaMiddleware();
  const store = createStore(rootReducer, persistedState, applyMiddleware(sagaMiddleware));
  sagaMiddleware.run(fetchSectionsSaga);
  return store;
}