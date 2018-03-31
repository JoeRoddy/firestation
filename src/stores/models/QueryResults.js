import { observable } from "mobx";

export function getNewResultsObject() {
  return observable({
    firebaseListener: null,
    payload: null,
    path: null,
    statementType: null,
    error: null,
    update(resultsData) {
      for (let key in resultsData) {
        this[key] = resultsData[key];
      }
    },
    clear() {
      this.payload = null;
      this.path = null;
      this.statementType = null;
      this.firebaseListener = null;
      this.error = null;
    }
  });
}
