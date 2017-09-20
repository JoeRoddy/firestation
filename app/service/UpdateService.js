import admin from 'firebase-admin';

export default class UpdateService {
    static updateFields(db, path, object, fields) {
        if (!fields || !object) {
            return;
        }
        var ref = db.ref(path);
        ref.once("value", function (snapshot) {
            let results = snapshot.val();
            fields.forEach(field => {
                if(field.includes('/')){
                    let keyValSplit = field.split('/');
                    results[keyValSplit[0]] = results[keyValSplit[0]] || {};
                    results[keyValSplit[0]][keyValSplit[1]] = object[field];
                }else {
                    results[field] = object[field];
                }
            })
            return db.ref(path).update(results);
        }, function (errorObject) {
            console.log("UPDATE ERROR: " + errorObject.code);
        });
    }

    static deleteObject(db, path) {
        db.ref(path).remove();
    }

    static pushObject(db, path, object) {
        db.ref(path).push(object);
    }

    static set(db, path, object) {
        db.ref(path).set(object);
    }
}