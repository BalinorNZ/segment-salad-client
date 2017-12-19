import { createStore, applyMiddleware } from 'redux';
import rootReducer from './Reducers/reducers';

export default(initialState) => {
  const persistedState = window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__();
  const middlewares = [];
  return createStore(rootReducer, persistedState, applyMiddleware(...middlewares));
}