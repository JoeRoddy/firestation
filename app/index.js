import React from 'react';
import { render } from 'react-dom';
import App from './components/App';
import './assets/stylesheets/base.scss';
import Store from './stores/Store';

const store = new Store();

const stores = {
  // Key can be whatever you want
  store: store
  // ...other stores
};

render(
  <App store={stores.store}/>,
  document.getElementById('root')
);
