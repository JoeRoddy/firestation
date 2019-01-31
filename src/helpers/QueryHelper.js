import fbsql, { configureFbsql, getConfig } from "fbsql";
import { startFirebaseApp } from "../db/FirebaseDb";
import StringHelper from "./StringHelper";

export default class QueryHelper {
  static executeQuery(
    { query, db, isFirestore = false, shouldCommitResults = false },
    callback
  ) {
    console.log("shouldCommit?", shouldCommitResults);

    let app = startFirebaseApp(db);
    configureFbsql({
      app,
      shouldCommitResults,
      isFirestore,
      shouldExpandResults: true
    });
    console.log("query:", query);
    console.log("fbsql:", fbsql);
    console.log("config:", getConfig());
    fbsql(query, callback);
  }

  static formatAndCleanQuery(query) {
    //called by App.jsx to remove comments before saving to history
    query = StringHelper.replaceAll(query, /(\/\/|--).+/, "");
    query = query.replace(/\r?\n|\r/g, " ");
    query = query.trim();
    return query;
  }

  // static getRootKeysPromise(database) {
  //   if (!database) {
  //     return null;
  //   }
  //   const url =
  //     "https://" +
  //     database.config.projectId +
  //     ".firebaseio.com//.json?shallow=true";
  //   return fetch(url).then(response => {
  //     return response.json();
  //   });
  // }
}
