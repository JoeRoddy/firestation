import React, { Component } from "react";
import PropTypes from "prop-types";
import { observer } from "mobx-react";

import store from "../stores/Store";

class Navbar extends Component {
  renderDatabases = () => {
    if (!store.databases) {
      return null;
    }
    return store.databases.map((db, index) => {
      return (
        <a
          className="dropdown-item"
          href="#"
          onClick={() => this.props.setCurrentDb(db)}
          key={index}
        >
          {db.title}
        </a>
      );
    });
  };

  getDatabaseJsx = () => {
    if (!store.databases) {
      return (
        <li className={"nav-db "}>
          <a onClick={() => store.modal.set("newDB")}>Add Your DB</a>
        </li>
      );
    } else {
      return (
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
            {this.renderDatabases()}
          </div>
        </li>
      );
    }
  };

  render() {
    return (
      <nav className="navbar navbar-expand-sm navbar-light bg-light">
        <a className="navbar-brand" onClick={() => {}}>
          <img
            src="https://firebasestorage.googleapis.com/v0/b/firestation-e149d.appspot.com/o/logo.ico?alt=media&token=7d5634ac-d956-42a8-8942-60bdeb21c06b"
            alt=""
          />
          <span> &nbsp;Firestation</span>
        </a>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav mr-auto">{this.getDatabaseJsx()}</ul>
        </div>
      </nav>
    );
  }
}

Navbar.propTypes = {
  setCurrentDb: PropTypes.func
};

export default observer(Navbar);
