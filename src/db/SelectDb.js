import StringHelper from "../helpers/StringHelper";
import QueryDetails from "../stores/models/QueryDetails";

const unfilteredFirestoreQuery = function(db, results, query, callback) {
  console.log("NON_FILTERABLE_FIRESTORE_QUERY");
  const { collection, selectedFields } = query;
  if (collection === "/") {
    //root query: select * from /;
    db.getCollections()
      .then(collections => {
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
      .catch(() => {
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

export { unfilteredFirestoreQuery };
