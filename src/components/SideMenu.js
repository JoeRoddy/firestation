import React from "react";
import { startFirebaseApp } from "../db/FirebaseDb";
import moment from "moment";
import store from "../stores/Store";
const { dialog, app } = require("electron").remote;
const shell = require("electron").shell;

const SideMenu = ({
  savedQueries,
  deleteQuery,
  savedQueriesIsOpen,
  toggleSavedQueries
}) => {
  const del = (e, query) => {
    e.stopPropagation();
    let queryDescrip = query.title
      ? query.title
      : query.queryDescrip.substring(0, 100);
    if (
      confirm(
        "Delete Query: " +
          queryDescrip +
          "\nThis will delete this query permanently, are you sure?"
      )
    ) {
      store.deleteQuery(query.body);
    }
  };

  const renderSavedQueries = () => {
    return savedQueries.map((query, index) => {
      return (
        <div
          className="sidemenu-savedQuery"
          key={index}
          onClick={() => store.appendQuery(query.body)}
        >
          {query && query.title && query.title.substring(0, 22)}
          <i className="fa fa-times" onClick={e => del(e, query)} />
        </div>
      );
    });
  };

  const savedCaret = () => {
    if (!savedQueries) {
      return null;
    }
    return savedQueriesIsOpen ? (
      <i className="fa fa-caret-up" />
    ) : (
      <i className="fa fa-caret-down" />
    );
  };

  let projectId =
    store.currentDatabase &&
    store.currentDatabase.serviceKey &&
    store.currentDatabase.serviceKey.project_id;
  const firebaseLink =
    "https://console.firebase.google.com/" +
    (projectId ? `project/${projectId}/overview` : "");

  return (
    <div className="Sidemenu">
      <a className="sidemenu-item" onClick={e => store.modal.set("config")}>
        <i className="fa fa-cog" /> &nbsp;DB Config
      </a>
      {savedQueries &&
        savedQueries.length > 0 && (
          <a className="sidemenu-item" onClick={toggleSavedQueries}>
            <i className="fa fa-floppy-o" /> &nbsp;Saved Queries {savedCaret()}
          </a>
        )}
      {savedQueries &&
        savedQueries.length > 0 &&
        savedQueriesIsOpen && (
          <div className="sidemenu-savedQueries">{renderSavedQueries()}</div>
        )}
      {/*<a className="sidemenu-item"><i className="fa fa-code" /> Query Translator</a>*/}
      <a className="sidemenu-item" onClick={e => store.modal.set("backup")}>
        <i className="fa fa-download" /> &nbsp;Download Backup
      </a>
      <a
        className="sidemenu-item"
        onClick={e => shell.openExternal("https://docs.firestation.io/")}
      >
        <i className="fa fa-book" /> &nbsp;Documentation
      </a>
      <a
        className="sidemenu-item"
        onClick={e => shell.openExternal(firebaseLink)}
      >
        <img
          src="https://firebasestorage.googleapis.com/v0/b/firestation-e149d.appspot.com/o/images%2FFirebase_icon.png?alt=media&token=fbe8d480-1178-4c16-a9cc-2785135967e9"
          alt=""
          className="firebase-sidemenu-icon"
        />
        &nbsp;Firebase Console
      </a>
    </div>
  );
};

export default SideMenu;
