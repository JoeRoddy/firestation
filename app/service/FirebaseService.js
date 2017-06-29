import admin from 'firebase-admin';

export default class FirebaseService {
    static databaseConfigInitializes(db) {
        let testApp;
        try {
            testApp = admin.initializeApp({
                credential: admin.credential.cert(db.serviceKey),
                databaseURL: db.url
            }, db.url);
        } catch (err) {
            return false;
        }

        testApp.delete();
        return true;
    }

    static startFirebaseApp(db) {
        if (!db) { return null; }
        let apps = admin.apps;
        for (let i = 0; i < apps.length; i++) {
            if (apps[i].name === db.url) {
                return apps[i];
            }
        }

        //app doesnt exist yet
        return admin.initializeApp({
            credential: admin.credential.cert(db.serviceKey),
            databaseURL: db.url
        }, db.url);
    }
}