import React from "react";
import PropTypes from "prop-types";
import JSONTree from "react-json-tree";
import _ from "lodash";

import store from "../../stores/Store";
import { set, deleteObject, setObjectProperty } from "../../db/UpdateDb";
import StringHelper from "../../helpers/StringHelper";

export default class Tree extends React.Component {
  state = {
    pathUnderEdit: null,
    keyUnderEdit: null
  };

  setPathUnderEdit = pathUnderEdit => this.setState({ pathUnderEdit });

  setKeyUnderEdit = keyUnderEdit => {
    this.setState({ keyUnderEdit, pathUnderEdit: null });
  };

  createNewProperty = () => {
    const isFirestore = (store.results || {}).isFirestore;
    setObjectProperty(
      store.currentDatabase,
      this.state.keyUnderEdit + "/" + this.state.newKey,
      this.state.newVal,
      isFirestore
    );
    this.setCreationPath(null);
  };

  detectKeyDoubleClick = (e, key) => {
    if (this.lastKeyClick && new Date().getTime() - this.lastKeyClick < 300) {
      this.setKeyUnderEdit(key);
      e.preventDefault();
      e.stopPropagation();
    }
    this.lastKeyClick = new Date().getTime();
  };

  render() {
    const { data, rootPath } = this.props;
    const { keyUnderEdit, pathUnderEdit } = this.state;

    return (
      <JSONTree
        hideRoot
        data={data}
        shouldExpandNode={(key, data, level) => level < 2}
        theme={TREE_THEME}
        labelRenderer={(path, type) => {
          return path.equals(keyUnderEdit) ? (
            <EditValue
              isKey
              value={path[0]}
              setPathUnderEdit={this.setKeyUnderEdit}
              path={path}
              rootPath={rootPath}
              dataAtKey={getDataAtPath({ data, path, rootPath })}
            />
          ) : (
            <strong
              className="noselect"
              onClick={e => this.detectKeyDoubleClick(e, path)}
            >
              {path[0]}
            </strong>
          );
        }}
        valueRenderer={(raw, value, ...path) =>
          path.equals(pathUnderEdit) ? (
            <EditValue
              value={value}
              setPathUnderEdit={this.setPathUnderEdit}
              path={path}
              rootPath={rootPath}
            />
          ) : (
            <em onClick={() => this.setPathUnderEdit(path)}>{raw}</em>
          )
        }
      />
    );
  }
}

Tree.propTypes = {
  data: PropTypes.object,
  rootPath: PropTypes.string
};

class EditValue extends React.Component {
  state = {
    input: ""
  };

  handleInput = e => {
    this.setState({ input: e.target.value });
  };

  submitOnEnter = ({ key }) => {
    if (key !== "Enter") return;

    const { path, rootPath } = this.props;
    const entirePath = `${rootPath}${rootPath !== "/" ? "/" : ""}${path
      .slice(0)
      .reverse()
      .toString()
      .replace(/,/g, "/")}`;
    const isFirestore = (store.results || {}).isFirestore;
    let newValue = StringHelper.getParsedValue(this.state.input);

    if (!this.props.isKey) {
      //value edit
      set(store.currentDatabase, entirePath, newValue, isFirestore);
    } else {
      //key edit
      const rootKey = `${rootPath}${rootPath !== "/" ? "/" : ""}${path
        .slice(1)
        .reverse()
        .toString()
        .replace(/,/g, "/")}`.replace(/^\//g, "/");
      if (
        !confirm(
          "This will permanently move all child data.\n Data location: " +
            entirePath +
            " ---> " +
            rootKey +
            (rootKey.charAt(rootKey.length - 1) !== "/" ? "/" : "") +
            newValue
        )
      ) {
        //TODO: confirm is bugged, hitting 'esc' is a confirm
        return;
      }
      const { dataAtKey } = this.props;
      if (rootKey === "/") {
        set(
          store.currentDatabase,
          `${rootKey}${
            rootKey.charAt(rootKey.length - 1) !== "/" ? "/" : ""
          }${newValue}`,
          dataAtKey,
          isFirestore
        );
        deleteObject(store.currentDatabase, entirePath, isFirestore);
      } else {
        //deep object key update
        let newObject = _.clone(dataAtKey);
        let oldKey = path[0];
        newObject[newValue] = newObject[oldKey];
        delete newObject[oldKey];
        newValue = newObject;
        set(store.currentDatabase, rootKey, newValue, isFirestore);
      }
    }
    this.props.setPathUnderEdit(null);
  };

  cancelOnEscape = ({ keyCode }) =>
    keyCode === 27 && this.props.setPathUnderEdit(null);

  render() {
    const { isKey, setKeyUnderEdit, setPathUnderEdit, value } = this.props;

    return (
      <em>
        <input
          placeholder={`${value}`}
          onChange={this.handleInput}
          onKeyDown={this.cancelOnEscape}
          onKeyPress={this.submitOnEnter}
          type="text"
          autoFocus
        />
        <span
          className="onClickOutside"
          onClick={() => setPathUnderEdit(null)}
        />
      </em>
    );
  }
}

EditValue.propTypes = {
  value: PropTypes.any,
  isKey: PropTypes.bool,
  setPathUnderEdit: PropTypes.func,
  setKeyUnderEdit: PropTypes.func,
  path: PropTypes.array,
  rootPath: PropTypes.string,
  dataAtKey: PropTypes.any
};

const getDataAtPath = ({ data, path, rootPath }) => {
  let val = data;
  if (rootPath !== "/" && path.length === 1) {
    // top level key edit on something like: select * from collection
    return data;
  }

  path
    .slice(path.length > 1 || path[0] === rootPath ? 1 : 0)
    .reverse()
    .forEach(key => {
      val = val[key];
    });
  return val;
};

const TREE_THEME = {
  scheme: "monokai",
  author: "wimer hazenberg (http://www.monokai.nl)",
  base00: "#272822",
  base01: "#383830",
  base02: "#49483e",
  base03: "#75715e",
  base04: "#a59f85",
  base05: "#f8f8f2",
  base06: "#f5f4f1",
  base07: "#f9f8f5",
  base08: "#f92672",
  base09: "#fd971f",
  base0A: "#f4bf75",
  base0B: "#a6e22e",
  base0C: "#a1efe4",
  base0D: "#66d9ef",
  base0E: "#ae81ff",
  base0F: "#cc6633"
};

// const KEY_CONFIRMATION_MSG =
//   "This will permanently move all child data.\n Data location: " +
//   pathUnderEdit +
//   " ---> " +
//   path +
//   "/" +
//   newValue;

if (Array.prototype.equals)
  console.warn(
    "Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code."
  );
Array.prototype.equals = function(array) {
  if (!array) return false;
  if (this.length != array.length) return false;
  for (let i = 0, l = this.length; i < l; i++) {
    if (this[i] instanceof Array && array[i] instanceof Array) {
      if (!this[i].equals(array[i])) return false;
    } else if (this[i] != array[i]) {
      return false;
    }
  }
  return true;
};
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", { enumerable: false });
