import React from "react";
import ReactTooltip from "react-tooltip";
import { inject, observer } from "mobx-react";
import { databaseConfigInitializes } from "../../db/FirebaseDb";
import store from "../../stores/Store";

const DatabaseConfig = observer(({ handleFile, closeModal }) => {
  const currentDatabase = store.currentDatabase;
  const save = () => {
    let database = store.currentDatabase;
    let title = document.getElementById("db-title-input").value;
    title = title ? title : store.currentDatabase.title;
    database.title = title;
    if (!store.newDb || !store.newDb.data) {
      store.modal.set(null);
      store.updateDatabase(database);
      return;
    }

    let path = store.newDb.path;
    path = path.substring(path.lastIndexOf("/") + 1);
    let serviceKey = store.newDb.data;
    if (!serviceKey) {
      alert("Something went wrong with your file.");
      return;
    }
    database.serviceKey = serviceKey;
    database.url = "https://" + serviceKey.project_id + ".firebaseio.com";
    database.path = path;
    let errMsg = databaseConfigInitializes(database)
      ? null
      : "Something went wrong with your DB config file. It should look something like: myDatabaseName-firebase-adminsdk-4ieef-1521f1bc13.json";
    if (errMsg) {
      alert(errMsg);
    } else {
      store.updateDatabase(database);
      store.modal.set(null);
    }
  };

  const clearNewDb = () => {
    store.newDb.clear();
  };

  const confirmDelete = () => {
    const confirmationMsg =
      "Are you sure you want to remove this database from Firestation?\n\nYour Firebase DB will be unaffected.";
    if (confirm(confirmationMsg)) {
      store.modal.set(null);
      store.deleteCurrentDatabase();
    }
  };

  return (
    <div className="DatabaseConfig">
      <div className="col-md-auto">
        <h2>DB: {currentDatabase.title}</h2>
        <br />
        <div className="nameEdit">
          <h4>Name:</h4>
          <input
            type="text"
            id="db-title-input"
            defaultValue={currentDatabase.title}
          />{" "}
          <br />
          <br />
        </div>
        <div className="serviceAcctEdit">
          <button onClick={handleFile} className="bt white">
            <i className="fa fa-file-text-o" /> New Key
          </button>
          {store.newDb && store.newDb.path ? (
            <div>
              New Service Account:{" "}
              <span className="detailText">
                <br />
                {store.newDb.path}
              </span>
            </div>
          ) : (
            <div>
              Current Service Account:{" "}
              <span className="detailText">
                <br />
                {currentDatabase.path}
              </span>
            </div>
          )}
        </div>
        <br />
        <button className="bt blue" onClick={save}>
          Save
        </button>
        <button className="bt red" onClick={closeModal}>
          Cancel
        </button>
        <button
          className="bt white sm delete-db-btn"
          onClick={confirmDelete}
          data-tip
          data-for="removeDbTooltip"
        >
          <i className="fa fa-trash" aria-hidden="true" />
        </button>
        <ReactTooltip
          id="removeDbTooltip"
          type="dark"
          effect="solid"
          place="top"
        >
          <span>Remove DB</span>
        </ReactTooltip>
        <span className="switch-container" />
      </div>
    </div>
  );
});

export default DatabaseConfig;
