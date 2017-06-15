import '../assets/stylesheets/base.scss';
import React, { Component } from 'react';
import Workbook from './Workbook';
import Workstation from './Workstation';
import Demo from './Demo';
import CacheHelper from '../helpers/CacheHelper';
import Navbar from './Navbar';
import Landing from './Landing';
import QueryHelper from '../helpers/QueryHelper';
import Modal from './modals/Modal';
// import { Router, Route, browserHistory, Link } from 'react-router';
import { inject, observer } from 'mobx-react';
import admin from 'firebase-admin'

// @inject('routing')
@observer
export default class App extends Component {
  constructor(props) {
    super(props);
    this.createDb = this.createDb.bind(this);
    this.commit = this.commit.bind(this);
    this.cancelCommit = this.cancelCommit.bind(this);
    this.updateSavedQueries = this.updateSavedQueries.bind(this);
  }

  componentWillMount() {
    this.setCurrentDb(this.props.store.currentDatabase);
  }

  setCurrentDb(currentDatabase) {
    if (!currentDatabase) { return }
    this.killFirebaseListeners();
    this.startFirebaseForDb(currentDatabase);
    this.props.store.setCurrentDatabase(currentDatabase);
    const that = this;
    // QueryHelper.getRootKeysPromise(currentDatabase).then(rootKeys => {
    //   console.log(rootKeys)
    //   this.props.store.rootKeys = rootKeys;
    // })
    CacheHelper.updateLocalStore("currentDatabase", currentDatabase);
  }

  updateSavedQueries(db) {
    const dbUrl = db.config.databaseURL;
    let queriesByDb = CacheHelper.getFromLocalStore("savedQueriesByDb");
    let savedQueries = (!queriesByDb || !queriesByDb[url]) ? null : queriesByDb[url];
    this.setState({ savedQueries });
  }

  createDb(database) {
    console.log("createdb called for db:", database)
    let err = this.props.store.createNewDatabase(database);
    if (err) { return err; }

    this.setCurrentDb(database);
    this.props.store.currentDatabase = database;
    this.props.store.modal = null;
    // browserHistory.push("/workstation")
  }

  startFirebaseForDb(db) {    
    if (!db || !db.url) { return; }
    let apps = admin.apps;
    for (let i = 0; i < apps.length; i++) {
      if (apps[i].name_ === db.url) { return; }
    }
    admin.initializeApp({
        credential: admin.credential.cert(db.serviceKey),
        databaseURL: db.url
      }, db.url)
  }

  executeQuery(query) {
    this.killFirebaseListeners();
    QueryHelper.executeQuery(query, this.props.store.currentDatabase, (results => {
      if (results && results.queryType != "SELECT_STATEMENT") {
        this.props.store.commitQuery = query;
        this.props.store.results = results;
        this.props.store.firebaseListeners.push(results.firebaseListener);
      } else {
        this.props.store.results = results;
        this.props.store.firebaseListeners.push(results.firebaseListener);
      }
    }));
  }

  commit() {
    this.killFirebaseListeners();
    if (!this.props.store.commitQuery || !this.props.store.currentDatabase) { return; }
    QueryHelper.executeQuery(this.props.store.commitQuery, this.props.store.currentDatabase, (results => {
      this.props.store.firebaseListeners.push(results.firebaseListener);
      this.killFirebaseListeners();
      this.props.store.clearResults();
    }), true);
  }

  killFirebaseListeners() {
    this.props.store.firebaseListeners.forEach(ref => {
      ref && ref.off("value");
    })
    this.props.store.firebaseListeners = [];
  }

  cancelCommit() {
    this.props.store.clearResults();
  }

  render() {
    // const { location, push, goBack } = this.props.routing;
    // const path = location.pathname;
    console.log("app props:", this.props)
    console.log('store:', this.props.store);
    const savedQueries = (this.props.store.savedQueriesByDb && this.props.store.currentDatabase)
      ? this.props.store.savedQueriesByDb[this.props.store.currentDatabase.url] : null;

    const props = {
      results: this.props.store.results,
      setCurrentDb: this.setCurrentDb.bind(this),
      executeQuery: this.executeQuery.bind(this),
      startFirebaseForDb: this.startFirebaseForDb,
      createDb: this.createDb,
      currentDatabase: this.props.store.currentDatabase,
      databases: this.props.store.databases,
      rootKeys: this.props.store.rootKeys,
      commitQuery: this.props.store.commitQuery,
      commit: this.commit,
      cancelCommit: this.cancelCommit,
      savedQueries: savedQueries,
      updateSavedQueries: this.updateSavedQueries,
      store: this.props.store,
      newDb: this.props.store.newDb
      // routing: this.props.routing
    }

    return (
      <div className="App">
        <Navbar {...props} />
        {this.props.store.modal && <Modal {...props} />}
        {/*{path === "/" &&
          <Landing {...props} />}
        {path === "/workstation" &&
          <Workstation {...props} />}*/}
        <Workstation {...props} />
      </div>
    )
  }
};

