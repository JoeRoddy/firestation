import { observable, computed } from "mobx";
import CacheHelper from "../helpers/CacheHelper";
import {
  startFirebaseApp,
  killFirebaseApps,
  databaseConfigInitializes
} from "../db/FirebaseDb";
import { getNewResultsObject } from "./models/QueryResults";

class Store {
  databases = observable(CacheHelper.getFromLocalStore("databases") || []);
  firestoreEnabled = observable.box(false);
  currentDatabase = observable({});
  rootKeys = observable({});
  savedQueriesByDb = observable(
    CacheHelper.getFromLocalStore("savedQueriesByDb") || {}
  );
  results = getNewResultsObject();
  commitQuery = observable.box("");
  modal = observable.box("");
  queryHistoryByDb = observable(
    CacheHelper.getFromLocalStore("queryHistoryByDb") || {}
  );
  firebaseListeners = observable([]);
  firestoreListeners = observable([]);

  //Modals
  newDb = observable({
    data: null,
    path: null,
    clear() {
      this.path = null;
      this.data = null;
    }
  });

  //Workstation
  queryHistoryIsOpen = observable.box(false);
  query = observable.box("");
  executingQuery = observable.box(false);

  //Workbook
  focus = observable.box(false);
  selectedText = observable.box("");
  constructor() {
    let currentDb = CacheHelper.getFromLocalStore("currentDatabase");
    this.setCurrentDatabase(currentDb);
  }

  appendQuery(text) {
    let currQuery = this.query.get();
    const query = currQuery ? currQuery + "\n" + text : text;
    this.query.set(query);
    this.focus.set(true);
  }

  toggleQueryHistory = () => {
    this.queryHistoryIsOpen.set(!this.queryHistoryIsOpen.get());
  };

  getQueryHistory() {
    if (!this.currentDatabase || !this.queryHistoryByDb) {
      return null;
    }
    return this.queryHistoryByDb[this.currentDatabase.url];
  }

  addQueryToHistory(query) {
    if (!this.currentDatabase) {
      return;
    }
    const dbURL = this.currentDatabase.url;
    let queryHistoryByDb = this.queryHistoryByDb ? this.queryHistoryByDb : {};
    let history =
      Object.keys(queryHistoryByDb).length > 0 && queryHistoryByDb[dbURL]
        ? queryHistoryByDb[dbURL]
        : [];
    let queryObj = { body: query.trim(), date: new Date() };
    if (history && history.length >= 15) {
      history = history.slice(0, 14);
    }
    history.unshift(queryObj);

    queryHistoryByDb[dbURL] = history;
    this.queryHistoryByDb = queryHistoryByDb;
    CacheHelper.updateLocalStore("queryHistoryByDb", queryHistoryByDb);
  }

  markQueryAsCommitted(query) {
    try {
      let history = this.queryHistoryByDb[this.currentDatabase.url];
      if (history[0].body.trim() !== query.trim()) {
        return;
      }
      history[0].committed = true;
      this.queryHistoryByDb[this.currentDatabase.url] = history;
      CacheHelper.updateLocalStore("queryHistoryByDb", this.queryHistoryByDb);
    } catch (err) {
      console.log(err);
    }
  }

  clearResults() {
    this.commitQuery.set(null);
    this.results.clear();
  }

  addNewListener = listener => {
    if (!listener) {
      return;
    }

    this[
      listener.type === "realtime" ? "firebaseListeners" : "firestoreListeners"
    ].push(listener);
  };

  killListeners = () => {
    this.firebaseListeners.forEach(listener => {
      listener && listener.unsubscribe();
    });
    this.firestoreListeners.forEach(listener => {
      listener && listener.unsubscribe();
    });
    this.firebaseListeners = [];
    this.firestoreListeners = [];
  };

  setCurrentDatabase(database) {
    if (!database) {
      this.modal.set("newDB");
    } else {
      this.firestoreEnabled.set(database.firestoreEnabled);
    }
    this.currentDatabase = database;
    this.queryHistoryIsOpen.set(false);
    this.query.set("");
    this.clearResults();
    CacheHelper.updateLocalStore("currentDatabase", database);
  }

  toggleFirestore(isFirestore = true) {
    this.firestoreEnabled.set(isFirestore);
    this.currentDatabase.firestoreEnabled = isFirestore;
    this.updateDatabase(this.currentDatabase);
  }

  createNewDatabase(database) {
    let err = this.checkDbForErrors(database);
    if (err) {
      return err;
    }
    database.firestoreEnabled = false;
    let databases = this.databases;
    this.databases.push(database);
    this.currentDatabase = database;
    CacheHelper.updateLocalStore("databases", databases);
    CacheHelper.updateLocalStore("currentDatabase", database);

    if (!this.savedQueriesByDb || !this.savedQueriesByDb[database.url]) {
      let exampleQueries = this.getExampleQueries();
      exampleQueries.forEach(q => {
        this.saveQuery(q);
      });
    }
  }

  deleteCurrentDatabase() {
    this.databases = this.databases.filter(db => {
      return (
        db.serviceKey.project_id !== this.currentDatabase.serviceKey.project_id
      );
    });

    CacheHelper.updateLocalStore("databases", this.databases);
    this.setCurrentDatabase(
      this.databases.length > 0 ? this.databases[0] : null
    );
    killFirebaseApps();
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
    let databases = this.databases;
    databases = databases ? databases : [];
    for (let i = 0; i < databases.length; i++) {
      let db = databases[i];
      if (db.title === database.title) {
        return 'You already have a database with the name "' + db.title + '".';
      } else if (db.serviceKey.project_id === database.serviceKey.project_id) {
        return 'This DB already exists as "' + db.title + '"';
      }
    }
    if (!databaseConfigInitializes(database)) {
      return "Something went wrong with your file. It should look something like: myDatabaseName-firebase-adminsdk-4ieef-1521f1bc13.json";
    }
    return false;
  }

  saveQuery(query) {
    const url = this.currentDatabase.url;
    let queriesByDb = CacheHelper.getFromLocalStore("savedQueriesByDb");
    queriesByDb = queriesByDb ? queriesByDb : {};
    let queriesForThisDb =
      queriesByDb && queriesByDb[url] ? queriesByDb[url] : [];
    queriesForThisDb.push(query);
    queriesByDb[url] = queriesForThisDb;
    this.savedQueriesByDb[url] = queriesForThisDb;
    CacheHelper.updateLocalStore("savedQueriesByDb", queriesByDb);
  }

  deleteQuery(query) {
    const url = this.currentDatabase.url;
    let queriesByDb = CacheHelper.getFromLocalStore("savedQueriesByDb");
    queriesByDb = queriesByDb ? queriesByDb : {};
    let queriesForThisDb =
      queriesByDb && queriesByDb[url] ? queriesByDb[url] : [];
    var i = queriesForThisDb.length;
    while (i--) {
      if (queriesForThisDb[i].body === query) {
        queriesForThisDb.splice(i, 1);
      }
    }
    queriesByDb[url] = queriesForThisDb;
    CacheHelper.updateLocalStore("savedQueriesByDb", queriesByDb);
    this.savedQueriesByDb[url] = queriesForThisDb;
  }

  getSavedQueries() {
    const savedQueries =
      this.savedQueriesByDb && this.currentDatabase
        ? this.savedQueriesByDb[this.currentDatabase.url]
        : null;
    return savedQueries;
  }

  getExampleQueries() {
    return [
      {
        title: "Example Select",
        body: "select * from users where email = 'johndoe@gmail.com';"
      },
      {
        title: "Example Update",
        body: "update users set legendaryPlayer = true where level > 100;"
      },
      {
        title: "Example Delete",
        body: "delete from users where cheater = true;"
      },
      {
        title: "Example Insert",
        body:
          "insert into users (name, level, email) values ('Joe', 99, 'joe@gmail.com');"
      }
    ];
  }

  @computed
  get currentDatabaseObject() {
    let app = startFirebaseApp(this.currentDatabase);
    return this.firestoreEnabled.get() ? app.firestore() : app.database();
  }
}

const store = new Store();
export default store;
