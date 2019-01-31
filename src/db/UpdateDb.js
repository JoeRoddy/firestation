import StringHelper from "../helpers/StringHelper";
import { startFirebaseApp } from "./FirebaseDb";

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
  path = path.charAt(0) === "/" && path.length > 1 ? path.substring(1) : path;
  path = StringHelper.replaceAll(path, "/", ".");
  let [collection, docAndField] = path.split(/\.(.+)/);
  let [docId, field] = docAndField.split(/\.(.+)/);
  if (!field) {
    //trying to create a new doc from obj tree
    return createFirestoreDocument(db, collection, { [docId]: value });
  }
  db.collection(collection)
    .doc(docId)
    .update({
      [field]: value
    });
};

export { deleteObject, set, setObjectProperty, pushObject, updateFields };
