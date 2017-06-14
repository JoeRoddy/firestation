import firebase from 'firebase';

export default class UpdateHelper {
    static updateFields(dbURL, path, object, fields) {
        if (!fields || !object) {
            return;
        }
        var db = firebase.database(firebase.app(dbURL))
        var ref = db.ref(path);
        ref.once("value", function (snapshot) {
            let results = snapshot.val();
            fields.forEach(field => {
                results[field] = object[field];
            })
            return db.ref(path).update(results);
        }, function (errorObject) {
            console.log("UPDATE ERROR: " + errorObject.code);
        });
    }

    static deleteObject(dbURL, path) {
        var db = firebase.database(firebase.app(dbURL))
        db.ref(path).remove();
    }

    static pushObject(dbURL, path, object) {
        var db = firebase.database(firebase.app(dbURL))
        db.ref(path).push(object);
    }

    static set(dbURL, path, object) {
        var db = firebase.database(firebase.app(dbURL))
        db.ref(path).set(object);
    }
}