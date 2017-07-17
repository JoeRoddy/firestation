import React from 'react';
import { render } from 'react-dom';
import App from './components/App';
import './assets/stylesheets/base.scss';
import Store from './stores/Store';
import CacheHelper from './helpers/CacheHelper';
import { CACHE_RESET } from './config';

if (CACHE_RESET) {
  CacheHelper.updateLocalStore("databases", null);
  CacheHelper.updateLocalStore("currentDatabase", null);
  CacheHelper.updateLocalStore("savedQueriesByDb", null);
  CacheHelper.updateLocalStore("queryHistoryByDb", null);
}

const store = new Store();
const stores = {
  store: store
};

render(
  <App store={stores.store} />,
  document.getElementById('root')
);
