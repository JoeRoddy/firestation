import * as admin from "firebase-admin";

const databaseConfigInitializes = function(db) {
  if (!db) {
    return null;
  }
  let preexistingApp = _getAppIfAlreadyExists(db.url);
  if (preexistingApp) return true;

  let testApp;

  try {
    testApp = admin.initializeApp(
      {
        credential: admin.credential.cert(db.serviceKey),
        databaseURL: db.url
      },
      db.url
    );
  } catch (err) {
    debugger;
    console.log("error initializing config:", err);
    return false;
  }

  testApp.delete();
  return true;
};

const startFirebaseApp = function(db) {
  if (!db) {
    return null;
  }

  return (
    _getAppIfAlreadyExists(db.url) ||
    admin.initializeApp(
      {
        credential: admin.credential.cert(db.serviceKey),
        databaseURL: db.url
      },
      db.url
    )
  );
};

const killFirebaseApps = function() {
  admin.apps.forEach(app => {
    app.delete();
  });
};

export { killFirebaseApps, startFirebaseApp, databaseConfigInitializes };

const _getAppIfAlreadyExists = url => {
  let apps = admin.apps;
  for (let i = 0; i < apps.length; i++) {
    if (apps[i].name === url) {
      return apps[i];
    }
  }
  return null;
};
