import React from "react";
import { observer } from "mobx-react";
import { shell } from "electron";

import store from "../../stores/Store";

const AddDatabase = observer(({ createDb, handleFile }) => {
  const newDb = store.newDb;
  const { path } = newDb;
  console.log("ADD_DB, newDb:", newDb);

  const save = () => {
    const serviceKey = newDb.data;
    if (!serviceKey) return alert("Something went wrong with your file.");
    let title = document.getElementById("db-title-input").value;
    title = title ? title : "My Firebase DB";
    const dbPath = path.substring(path.lastIndexOf("/") + 1);
    const database = {
      title: title,
      serviceKey,
      url: "https://" + serviceKey.project_id + ".firebaseio.com",
      path: dbPath
    };
    const errMsg = createDb(database);
    if (errMsg) {
      alert(errMsg);
    } else {
      newDb.clear();
    }
  };

  const clearNewDb = () => {
    newDb.clear();
  };

  return (
    <div className="AddDatabase row justify-content-md-center">
      <div className="col-md-auto">
        <h2>Add a Firebase Database</h2> <br />
        <div>
          <p>
            1){" "}
            <a
              onClick={() =>
                shell.openExternal(
                  "https://console.firebase.google.com/u/0/project/_/settings/serviceaccounts/adminsdk"
                )
              }
            >
              Select your project on Firebase
            </a>
          </p>
          <p>{`2) Select "GENERATE NEW PRIVATE KEY"`}</p>
          <p>3) Import the key into Firestation</p>
          <div>
            <button onClick={handleFile} className="bt white">
              <i className="fa fa-file-text-o" /> Import Key
            </button>
            <span className="">
              <i>Note:</i> this key <b>never</b> leaves your machine
            </span>
          </div>
          {newDb && newDb.path && (
            <div className="detailText">
              <br />
              {newDb.path} <i className="fa fa-times" onClick={clearNewDb} />
            </div>
          )}
          <br />
          <br />
          <input
            type="text"
            id="db-title-input"
            placeholder="Database Name"
          />{" "}
          <br />
          <br />
        </div>
        <button className="bt blue" onClick={save}>
          Save
        </button>
      </div>
    </div>
  );
});

export default AddDatabase;
