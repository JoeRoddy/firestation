import { observable } from 'mobx';
import CacheHelper from '../helpers/CacheHelper';

class Store {
  @observable databases = CacheHelper.getFromLocalStore("databases");
  databases = this.databases ? this.databases : [];
  @observable currentDatabase = CacheHelper.getFromLocalStore("currentDatabase");
  @observable rootKeys = null;
  @observable savedQueriesByDb = CacheHelper.getFromLocalStore("savedQueriesByDb");
  @observable results = null;
  @observable commitQuery = null;
  @observable modal = null;
  @observable queryHistoryByDb = CacheHelper.getFromLocalStore("queryHistoryByDb");
  @observable firebaseListeners = [];

  //Modals
  @observable newDb = null;
  
  //Workstation
  @observable queryHistoryIsOpen = false;
  @observable query = "";

  //Workbook
  @observable focus = false;
  @observable selectedText = "";
  constructor() {
    // CacheHelper.updateLocalStore("databases",null);
    // CacheHelper.updateLocalStore("currentDatabase",null);
    // CacheHelper.updateLocalStore("savedQueriesByDb",null);
    // CacheHelper.updateLocalStore("queryHistoryByDb",null);
  }

  appendQuery(text) {
    const query = this.query ? this.query + "\n" + text : text;
    this.query = query;
  }

  getQueryHistory() {
    if (!this.currentDatabase || !this.queryHistoryByDb) { return null; }
    return this.queryHistoryByDb[this.currentDatabase.url];
  }

  addQueryToHistory(query) {
    if (!this.currentDatabase) { return; }
    const dbURL = this.currentDatabase.url;
    let queryHistoryByDb = this.queryHistoryByDb ? this.queryHistoryByDb : {};
    let history = Object.keys(queryHistoryByDb).length > 0 && queryHistoryByDb[dbURL] ? queryHistoryByDb[dbURL] : [];
    let queryObj = { body: query, date: new Date() }
    if (history && history.length >= 15) {
      history = history.slice(0, 14);
    }
    history.unshift(queryObj);

    queryHistoryByDb[dbURL] = history;
    this.queryHistoryByDb = queryHistoryByDb;
    CacheHelper.updateLocalStore("queryHistoryByDb", queryHistoryByDb);
  }

  clearResults() {
    this.commitQuery = null;
    this.results = null;
  }

  setCurrentDatabase(database) {
    this.currentDatabase = database;
    this.queryHistoryIsOpen = false;
    this.query = "";
    this.clearResults();
    CacheHelper.updateLocalStore("currentDatabase", database);
  }

  createNewDatabase(database) {
    let err = this.checkDbForErrors(database);
    if (err) { return err; }
    let databases = this.databases;
    this.databases.push(database);
    this.currentDatabase = database;
    CacheHelper.updateLocalStore("databases", databases);
    CacheHelper.updateLocalStore("currentDatabase", database);
  }

  updateDatabase(database) {
    let databases = this.databases.map(db => {
      if (database.serviceKey.project_id === db.serviceKey.project_id) {
        return database;
      } else {
        return db;
      }
    });
    this.databases = databases;
    this.currentDatabase = database;
    CacheHelper.updateLocalStore("currentDatabase", database);
    CacheHelper.updateLocalStore("databases", databases);
  }

  checkDbForErrors(database) {
    console.log(database);
    let databases = this.databases;
    databases = databases ? databases : [];
    for (let i = 0; i < databases.length; i++) {
      let db = databases[i];
      if (db.title === database.title) {
        return "You already have a database with the name \"" + db.title + "\".";
      } 
      else if (db.serviceKey.project_id === database.serviceKey.project_id) {
        return "This DB already exists as \"" + db.title + "\"";
      }
    }
    return false;
  }

  saveQuery(query) {
    const url = this.currentDatabase.url;
    let queriesByDb = CacheHelper.getFromLocalStore("savedQueriesByDb");
    queriesByDb = queriesByDb ? queriesByDb : {};
    let queriesForThisDb = (queriesByDb && queriesByDb[url]) ? queriesByDb[url] : [];
    queriesForThisDb.push(query);
    queriesByDb[url] = queriesForThisDb;
    this.savedQueriesByDb = queriesByDb;
    CacheHelper.updateLocalStore("savedQueriesByDb", queriesByDb);
  }

  deleteQuery(query) {
    const url = this.currentDatabase.url;
    let queriesByDb = CacheHelper.getFromLocalStore("savedQueriesByDb");
    queriesByDb = queriesByDb ? queriesByDb : {};
    let queriesForThisDb = (queriesByDb && queriesByDb[url]) ? queriesByDb[url] : [];
    var i = queriesForThisDb.length;
    while (i--) {
      if (queriesForThisDb[i].body === query) {
        queriesForThisDb.splice(i, 1);
      }
    }
    queriesByDb[url] = queriesForThisDb;
    this.savedQueriesByDb = queriesByDb;
    CacheHelper.updateLocalStore("savedQueriesByDb", queriesByDb);
  }
}
export default Store;
