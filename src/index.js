import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { Provider } from 'mobx-react';
import RootStore from "./models/root";
import { connectReduxDevtools } from "mst-middlewares";
const initialState = {};


// enable redux chrome dev tools for mobx state tree
const store = (window.store = RootStore.create(initialState));
connectReduxDevtools(require("remotedev"), store);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);


// alternatively, use this code to enable mobx chrome dev tools
// import makeInspectable from 'mobx-devtools-mst';
//const store = RootStore.create(initialState);
//makeInspectable(store);