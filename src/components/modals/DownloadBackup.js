import React, { Component } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import fs from "fs";
const { app, dialog } = require("electron").remote;

import store from "../../stores/Store";
import QueryDetails from "../../stores/models/QueryDetails";
import { unfilteredFirestoreQuery } from "../../db/SelectDb";
import { startFirebaseApp } from "../../db/FirebaseDb";

export default class DownloadBackup extends Component {
  state = {
    downloading: [],
    downloadStarted: false,
    errMsg: null,
    statusMsg: null,
    numDone: 0,
    checked: "realtime"
  };

  download = () => {
    this.setState({ downloadStarted: true }, () => {
      if (this.state.checked === "both") {
        this.setState({ downloading: ["realtime", "firestore"] }, () => {
          this.backUpFirestoreDb();
          this.backUpRealtimeDb();
        });
      } else if (this.state.checked === "realtime") {
        this.setState({ downloading: ["realtime"] }, () =>
          this.backUpRealtimeDb()
        );
      } else if (this.state.checked === "firestore") {
        this.setState({ downloading: ["firestore"] }, () =>
          this.backUpFirestoreDb()
        );
      }
    });
  };

  handleDownloadResult = (errMsg, dbType, statusMsg, isDone) => {
    const numDone = isDone ? this.state.numDone + 1 : this.state.numDone;
    this.setState({ errMsg, statusMsg, numDone }, () => {
      if (
        this.state.downloading.length > 0 &&
        numDone >= this.state.downloading.length
      ) {
        store.modal.set(null);
        setTimeout(() => {
          alert(
            `Download${this.state.downloading.length > 1 ? "s" : ""} Complete!`
          );
        }, 200);
      }
    });
  };

  writeDataToDisk = (data, dbType, callback) => {
    callback(null, dbType, "Writing db to disk");
    let path = `${app.getPath("desktop")}/${moment().format("MMMDo")}_${
      store.currentDatabase.title
    }_${dbType}.json`;
    dialog.showSaveDialog({ defaultPath: path }, fileName => {
      if (fileName === undefined) return;
      fs.writeFile(fileName, JSON.stringify(data), err => {
        err ? callback(err) : callback(null, dbType, "Download complete", true);
      });
    });
  };

  backUpRealtimeDb = () => {
    let db = startFirebaseApp(store.currentDatabase).database();
    db.ref("/").once("value", snap => {
      this.writeDataToDisk(snap.val(), "realtime", this.handleDownloadResult);
    });
  };

  backUpFirestoreDb = () => {
    let callback = this.handleDownloadResult;
    let db = startFirebaseApp(store.currentDatabase).firestore();
    callback(null, "firestore", "Downloading Firestore DB..");
    let query = new QueryDetails();
    query.collection = "/";
    unfilteredFirestoreQuery(db, { payload: {} }, query, res => {
      return this.writeDataToDisk(res.payload, "firestore", callback);
    });
  };

  render() {
    return (
      <div>
        <h4>
          Download Backup{" "}
          {store.currentDatabase && ` - ${store.currentDatabase.title}`}
        </h4>
        <br />
        {!this.state.downloadStarted ? (
          <div>
            <form className="mb-4">
              <RadioInput val="realtime" name="Realtime Database" that={this} />
              <RadioInput val="firestore" name="Cloud Firestore" that={this} />
              <RadioInput val="both" name="Both" that={this} />
            </form>
            <button className="bt blue" onClick={this.download}>
              Download
            </button>{" "}
            &nbsp;&nbsp;
            <button
              className="bt red"
              onClick={e => {
                store.modal.set(null);
              }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <div>
            <br />
            {this.state.numDone >= this.state.downloading.length ? (
              <span className="text-success">
                Download{this.state.downloading.length > 1 && "s"} complete!
              </span>
            ) : (
              <span>{this.state.statusMsg}</span>
            )}
          </div>
        )}
        {this.state.errMsg && (
          <div className="text-danger">Error: {this.state.errMsg}</div>
        )}
      </div>
    );
  }
}

DownloadBackup.propTypes = {};

const RadioInput = ({ val, name, that }) => {
  return (
    <span
      onClick={() => that.setState({ checked: val })}
      className="cursor-pointer"
    >
      <input
        type="radio"
        onChange={() => {}}
        checked={that.state.checked === val}
      />{" "}
      {name}
      <br />
    </span>
  );
};

RadioInput.propTypes = {
  val: PropTypes.bool,
  name: PropTypes.string,
  that: PropTypes.object
};
