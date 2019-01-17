import React from "react";
import PropTypes from "prop-types";
import { observer, propTypes } from "mobx-react";

import store from "../stores/Store";

const Navbar = ({ setCurrentDb }) => (
  <nav className="navbar navbar-expand-sm navbar-light bg-light">
    <a className="navbar-brand" onClick={() => {}}>
      <img
        src="https://firebasestorage.googleapis.com/v0/b/firestation-e149d.appspot.com/o/logo.ico?alt=media&token=7d5634ac-d956-42a8-8942-60bdeb21c06b"
        alt=""
      />
      <span> &nbsp;Firestation</span>
    </a>
    <DatabaseDropdown setCurrentDb={setCurrentDb} />
  </nav>
);

Navbar.propTypes = {
  setCurrentDb: PropTypes.func
};

export default observer(Navbar);

const DatabaseDropdown = ({ setCurrentDb }) => (
  <div className="collapse navbar-collapse" id="navbarSupportedContent">
    <ul className="navbar-nav mr-auto">
      {!store.databases ? (
        <li className={"nav-db "}>
          <a onClick={() => store.modal.set("newDB")}>Add Your DB</a>
        </li>
      ) : (
        <li className="nav-item dropdown">
          <a
            className="nav-link dropdown-toggle"
            href="#"
            id="navbarDropdown"
            role="button"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
          >
            {store.currentDatabase && store.currentDatabase.title
              ? store.currentDatabase.title
              : "Databases"}
          </a>
          <div className="dropdown-menu" aria-labelledby="navbarDropdown">
            <a
              className="dropdown-item"
              href="#"
              onClick={() => store.modal.set("newDB")}
            >
              Add New DB
            </a>
            <div className="dropdown-divider" />
            <DatabaseList
              databases={store.databases}
              setCurrentDb={setCurrentDb}
            />
          </div>
        </li>
      )}
    </ul>
  </div>
);

DatabaseDropdown.propTypes = {
  setCurrentDb: PropTypes.func
};

const DatabaseList = ({ databases = [], setCurrentDb }) => (
  <React.Fragment>
    {databases.map((db, index) => {
      return (
        <a
          className="dropdown-item"
          href="#"
          onClick={() => setCurrentDb(db)}
          key={index}
        >
          {db.title}
        </a>
      );
    })}
  </React.Fragment>
);

DatabaseList.propTypes = {
  databases: propTypes.arrayOrObservableArray,
  setCurrentDb: PropTypes.func
};
