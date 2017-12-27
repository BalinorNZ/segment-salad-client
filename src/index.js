import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { Provider } from 'mobx-react';
import RootStore from "./models/root";
import makeInspectable from 'mobx-devtools-mst';
// import { asReduxStore, connectReduxDevtools } from "mst-middlewares"
// import remotedev from 'mobx-remotedev';


const initialState = {};
const store = RootStore.create(initialState);
// enable mobx chrome dev tools
makeInspectable(store);

// enable redux chrome dev tools for mobx state tree
// const store = (window.segments = SegmentStore.create(initialState));
// const redux_store = asReduxStore(store);
// connectReduxDevtools(require("remotedev"), store);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);

