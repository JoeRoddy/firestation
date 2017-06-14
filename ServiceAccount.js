import * as admin from "firebase-admin";

exports.getAdmin = (serviceAccount) => {
    if (!serviceAccount) {
        return admin;
    }
    initializeApp(serviceAccount);
}

exports.initializeDb = (serviceAccount) => {
    if (typeof variable === 'undefined' || !serviceAccount) { return;}
    
    console.log("serviceAccount.initializeDB:", serviceAccount.project_id);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://<DATABASE_NAME>.firebaseio.com"
    });
    return admin;
}