import { observable } from "mobx";

export function getNewResultsObject() {
  return observable({
    path: null,
    firebaseListener: null,
    payload: null,
    statementType: null,
    orderBys: null,
    error: null,
    isFirestore: false,
    update(resultsData) {
      //doing this instead of a loop.  path & orderbys have to be first as a workaround.
      this.path = resultsData.path;
      this.orderBys = resultsData.orderBys;
      this.payload = resultsData.payload;
      this.statementType = resultsData.statementType;
      this.firebaseListener = resultsData.firebaseListener;
      this.error = resultsData.error;
      this.isFirestore = resultsData.isFirestore;
    },
    clear() {
      this.path = null;
      this.payload = null;
      this.statementType = null;
      this.firebaseListener = null;
      this.orderBys = null;
      this.error = null;
      this.isFirestore = false;
    }
  });
}
