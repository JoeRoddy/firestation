import StringHelper from "../helpers/StringHelper";
import { isValidDate, executeDateComparison } from "../helpers/DateHelper";
import { startFirebaseApp } from "./FirebaseDb";
import QueryDetails from "../stores/models/QueryDetails";

const getDataForSelect = function(databaseSavedData, query, callback) {
  const { wheres, selectedFields, isFirestore } = query;
  const app = startFirebaseApp(databaseSavedData);
  let db = isFirestore ? app.firestore() : app.database();
  //TODO: reimplement listeners, using firestore listeners as well
  let results = {
    statementType: "SELECT_STATEMENT",
    path: query.collection,
    orderBys: query.orderBys,
    payload: {},
    isFirestore
  };
  if (
    !wheres ||
    (wheres[0] && wheres[0] && wheres[0].error === "NO_EQUALITY_STATEMENTS")
  ) {
    //unfilterable query, grab whole collection
    const collectionCallback = res => {
      if (wheres && wheres[0]) {
        res.payload = filterWheresAndNonSelectedFields(
          res.payload,
          wheres,
          selectedFields
        );
        // results.firebaseListener = ref;
      }
      return callback(res);
    };
    query.isFirestore
      ? unfilteredFirestoreQuery(db, results, query, collectionCallback)
      : queryEntireRealtimeCollection(db, results, query, collectionCallback);
  } else {
    //filterable query
    query.isFirestore
      ? executeFilteredFirestoreQuery(db, results, query, callback)
      : executeFilteredRealtimeQuery(db, results, query, callback);
  }
};

const unfilteredFirestoreQuery = function(db, results, query, callback) {
  console.log("NON_FILTERABLE_FIRESTORE_QUERY");
  const { collection, selectedFields, shouldApplyListener } = query;
  if (collection === "/") {
    //root query: select * from /;
    db.getCollections()
      .then(collections => {
        let colIds = Object.keys(collections);
        let numDone = 0;
        let firestoreData = {};
        collections.forEach(collection => {
          let colId = collection.id;
          let query = new QueryDetails();
          query.collection = colId;
          unfilteredFirestoreQuery(db, { payload: {} }, query, res => {
            firestoreData[colId] = res.payload;
            if (++numDone >= collections.length) {
              results.payload = firestoreData;
              return callback(results);
            }
          });
        });
      })
      .catch(err => {
        results.error = err.message;
        return callback(results);
      });
  } else if (collection.includes("/")) {
    //select * from collection.document
    let [col, field] = collection.split(/\/(.+)/);
    field = StringHelper.replaceAll(field, "/", ".");
    db.collection(col)
      .doc(field)
      .get()
      .then(doc => {
        if (doc.exists) {
          results.payload = doc.data();
          if (selectedFields) {
            results.payload = removeNonSelectedFieldsFromResults(
              results.payload,
              selectedFields
            );
          }
          return callback(results);
        } else {
          // doc.data() will be undefined in this case
          results.error = { message: "No such document" };
          return callback(results);
        }
      })
      .catch(function(error) {
        results.error = { message: "No such document" };
        return callback(results);
      });
  } else {
    //select * from collection
    //TODO: figure out a way to make this a listener
    db.collection(collection)
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          results.payload[doc.id] = doc.data();
        });
        if (selectedFields) {
          results.payload = removeNonSelectedFieldsFromResults(
            results.payload,
            selectedFields
          );
        }
        return callback(results);
      })
      .catch(err => {
        results.error = err.message;
        return callback(results);
      });
  }
};

const queryEntireRealtimeCollection = function(db, results, query, callback) {
  const { collection, selectedFields, shouldApplyListener } = query;
  console.log("NON_FILTERED_REALTIME_QUERY");
  console.log("collection:", collection);

  let ref = db.ref(collection);
  ref[shouldApplyListener ? "on" : "once"]("value", snapshot => {
    results.payload = snapshot.val();
    if (selectedFields) {
      results.payload = removeNonSelectedFieldsFromResults(
        results.payload,
        selectedFields
      );
    }
    results.firebaseListener = {
      unsubscribe: () => ref.off("value"),
      type: "realtime"
    };
    return callback(results);
  });
};

const executeFilteredFirestoreQuery = function(db, results, query, callback) {
  const {
    collection,
    selectedFields,
    wheres,
    orderBys,
    shouldApplyListener
  } = query;
  console.log("FILTERED_FIRESTORE");
  const mainWhere = wheres[0];
  let unsub = db
    .collection(collection)
    .where(mainWhere.field, mainWhere.comparator, mainWhere.value)
    .onSnapshot(
      snapshot => {
        let payload = {};
        snapshot.forEach(doc => {
          payload[doc.id] = doc.data();
        });
        payload = filterWheresAndNonSelectedFields(
          payload,
          wheres,
          selectedFields
        );
        results.payload = payload;
        results.firebaseListener = {
          type: "firestore",
          unsubscribe: () => unsub()
        };
        callback(results);
      },
      err => {
        results.error = err.message;
        return callback(results);
      }
    );
};

const executeFilteredRealtimeQuery = function(db, results, query, callback) {
  const {
    collection,
    selectedFields,
    wheres,
    orderBys,
    shouldApplyListener
  } = query;
  console.log("FILTERED_REALTIME");

  const mainWhere = wheres[0];
  let ref = db.ref(collection);
  ref
    .orderByChild(mainWhere.field)
    .equalTo(mainWhere.value)
    .on("value", snapshot => {
      results.payload = filterWheresAndNonSelectedFields(
        snapshot.val(),
        wheres,
        selectedFields
      );
      console.log("select results: ", results);
      results.firebaseListener = {
        unsubscribe: () => ref.off("value"),
        type: "realtime"
      };
      return callback(results);
    });
};

const filterWheresAndNonSelectedFields = function(
  resultsPayload,
  wheres,
  selectedFields
) {
  if (wheres.length > 1) {
    resultsPayload = filterResultsByWhereStatements(
      resultsPayload,
      wheres.slice(1)
    );
  }
  if (selectedFields) {
    resultsPayload = removeNonSelectedFieldsFromResults(
      resultsPayload,
      selectedFields
    );
  }
  return resultsPayload;
};

const removeNonSelectedFieldsFromResults = (results, selectedFields) => {
  if (!results || !selectedFields) {
    return results;
  }
  Object.keys(results).forEach((objKey, index) => {
    if (typeof results[objKey] !== "object") {
      if (!selectedFields[objKey]) {
        delete results[objKey];
      }
    } else {
      Object.keys(results[objKey]).forEach((propKey, index) => {
        if (!selectedFields[propKey]) {
          delete results[objKey][propKey];
        }
      });
    }
  });
  return Object.keys(results).length === 1
    ? results[Object.keys(results)[0]]
    : results;
};

const filterResultsByWhereStatements = (results, whereStatements) => {
  if (!results) {
    return null;
  }
  let returnedResults = {};
  let nonMatch = {};
  for (let i = 0; i < whereStatements.length; i++) {
    let indexOffset = 1;
    let where = whereStatements[i];
    Object.keys(results).forEach(function(key, index) {
      let thisResult = results[key][where.field];
      if (!conditionIsTrue(thisResult, where.value, where.comparator)) {
        nonMatch[key] = results[key];
      }
    });
  }
  if (nonMatch) {
    Object.keys(results).forEach(function(key, index) {
      if (!nonMatch[key]) {
        returnedResults[key] = results[key];
      }
    });
    return returnedResults;
  } else {
    return results;
  }
};

const conditionIsTrue = (val1, val2, comparator) => {
  switch (comparator) {
    case "==":
      return determineEquals(val1, val2);
    case "!=":
      return !determineEquals(val1, val2);
    case "<=":
    case "<":
    case ">=":
    case ">":
      return determineGreaterOrLess(val1, val2, comparator);
    case "like":
      return StringHelper.determineStringIsLike(val1, val2);
    case "!like":
      return !StringHelper.determineStringIsLike(val1, val2);
    default:
      throw "Unrecognized comparator: " + comparator;
  }
};

const determineEquals = (val1, val2) => {
  val1 = typeof val1 == "undefined" || val1 == "null" ? null : val1;
  val2 = typeof val2 == "undefined" || val2 == "null" ? null : val2;
  return val1 === val2;
};

const determineGreaterOrLess = (val1, val2, comparator) => {
  let isNum = false;
  if (isNaN(val1) || isNaN(val2)) {
    if (isValidDate(val1) && isValidDate(val2)) {
      return executeDateComparison(val1, val2, comparator);
    }
  } else {
    isNum = true;
  }
  switch (comparator) {
    case "<=":
      return isNum ? val1 <= val2 : val1.length <= val2.length;
    case ">=":
      return isNum ? val1 >= val2 : val1.length >= val2.length;
    case ">":
      return isNum ? val1 > val2 : val1.length < val2.length;
    case "<":
      return isNum ? val1 < val2 : val1.length < val2.length;
  }
};

export { getDataForSelect, unfilteredFirestoreQuery };
