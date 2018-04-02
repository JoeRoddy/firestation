import * as admin from "firebase-admin";
import StringHelper from "../helpers/StringHelper";
import {
  killFirebaseApps,
  startFirebaseApp,
  databaseConfigInitializes
} from "./FirebaseDb";
import { start } from "repl";

const updateFields = function(savedDatabase, path, object, fields) {
  if (!fields || !object) {
    return;
  }

  console.log("insertData: ", object);
  console.log("path:", path);
  console.log("fields:", fields);
  console.log("\n\n");

  const app = startFirebaseApp(savedDatabase);
  return savedDatabase.firestoreEnabled
    ? updateFirestoreFields(app.firestore(), path, object, fields)
    : updateRealtimeFields(app.database(), path, object, fields);
};

const updateRealtimeFields = function(db, path, object, fields) {
  db.ref(path).once(
    "value",
    snapshot => {
      let updateObject = Object.assign(currentData, newData);
      return db.ref(path).update(updateObject);
    },
    errorObject => {
      console.log("UPDATE ERROR: " + errorObject.code);
    }
  );
};

const updateFirestoreFields = function(db, path, object, fields) {
  let [col, doc] = path.split(/\/(.+)/); // splits only on first '/' char
  console.log("path:", path);
  console.log("col:", col);
  console.log("doc:", doc);
  console.log("new data:", object);

  return db
    .collection(col)
    .doc(doc)
    .set(object)
    .then(() => {
      console.log(`doc @ path ${path} successfully updated`);
    })
    .catch(error => {
      console.error(`error updating doc @ ${path} :`, error);
    });
};

const deleteObject = function(savedDatabase, path, isFirestore) {
  const app = startFirebaseApp(savedDatabase);
  isFirestore
    ? deleteFirestoreData(app.firestore(), path)
    : app
        .database()
        .ref(path)
        .remove();
};

const deleteFirestoreData = function(db, path) {
  let [collection, doc] = path.split(/\/(.+)/); //splits on first "/"
  doc.includes("/")
    ? deleteFirestoreField(db, collection, doc)
    : deleteFirestoreDoc(db, collection, doc);
};

const deleteFirestoreDoc = function(db, collection, doc) {
  console.log(`delete, col: ${collection}\ndoc: ${doc}`);
  db
    .collection(collection)
    .doc(doc)
    .delete()
    .then(function() {
      console.log("Document successfully deleted!");
    })
    .catch(function(error) {
      console.error("Error removing document: ", error);
    });
};

const deleteFirestoreField = function(db, collection, docAndField) {
  let [doc, field] = docAndField.split(/\/(.+)/);
  field = StringHelper.replaceAll(field, "/", ".");
  console.log(`deleting field, ${field} from col:${collection}, doc: ${doc}`);
  db
    .collection(collection)
    .doc(doc)
    .update({
      [field]: admin.firestore.FieldValue.delete()
    });
};

const pushObject = function(savedDatabase, path, object) {
  const app = startFirebaseApp(savedDatabase);
  const db = savedDatabase.firestoreEnabled ? app.firestore() : app.database();
  savedDatabase.firestoreEnabled
    ? createFirestoreDocument(db, path, object)
    : db.ref(path).push(object);
};

const createFirestoreDocument = function(db, path, data) {
  let [collection, docId] = path.split(/\/(.+)/);
  docId
    ? setFirestoreDocWithExplicitId(db, collection, docId, data)
    : pushFirestoreDocToGeneratedId(db, collection, data);
};

const setFirestoreDocWithExplicitId = function(db, collection, docId, data) {
  console.log(`setting doc ${docId} in collection ${collection}, data:`, data);
  db
    .collection(collection)
    .doc(docId)
    .set(data);
};

const pushFirestoreDocToGeneratedId = function(db, collection, data) {
  collection = collection.replace(/\/+$/, ""); //remove trailing "/"
  console.log(`pushing to collection ${collection}, data:`, data);
  db
    .collection(collection)
    .add(data)
    .then(docRef => {
      console.log("Document written with ID: ", docRef.id);
    })
    .catch(error => {
      console.error("Error adding document: ", error);
    });
};

const set = function(savedDatabase, path, data, isFirestore) {
  const app = startFirebaseApp(savedDatabase);
  const db = isFirestore ? app.firestore() : app.database();
  if (isFirestore) {
    let [collection, docId] = path.split(/\/(.+)/);
    docId.includes("/")
      ? setFirestoreProp(db, path, data)
      : setFirestoreDocWithExplicitId(db, collection, docId, data);
  } else {
    db.ref(path).set(data);
  }
};

const setObjectProperty = function(savedDatabase, path, value, isFirestore) {
  value = StringHelper.getParsedValue(value);
  const app = startFirebaseApp(savedDatabase);
  isFirestore
    ? setFirestoreProp(app.firestore(), path, value)
    : app
        .database()
        .ref(path)
        .set(value);
};

const setFirestoreProp = function(db, path, value) {
  path = StringHelper.replaceAll(path, "/", ".");
  let [collection, docAndField] = path.split(/\.(.+)/);
  let [docId, field] = docAndField.split(/\.(.+)/);
  console.log(`setting document prop ${field} @ ${collection}/${docId}`);
  db
    .collection(collection)
    .doc(docId)
    .update({
      [field]: value
    });
};

module.exports = {
  deleteObject,
  set,
  setObjectProperty,
  pushObject,
  updateFields
};
