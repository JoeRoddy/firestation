import React, { Component } from "react";
import ReactTooltip from "react-tooltip";
import { observer } from "mobx-react";

import Workbook from "./Workbook";
import SideMenu from "./SideMenu";
import QueryHistory from "./QueryHistory";
import QueryResults from "./QueryResults";
import ButtonRow from "./ButtonRow";

@observer
export default class Workstation extends Component {
  state = {
    savedQueries: null,
    savedQueriesIsOpen: true,
    modal: null,
    resultsOpen: true
  };

  componentDidMount() {
    if (!this.props.store.databases[0]) {
      this.props.store.modal = "newDB";
    }
  }

  execute = () => {
    let selectedText = this.getSelectionText();
    let query = this.props.store.query;
    if (selectedText && query.includes(selectedText)) {
      query = selectedText;
    }
    this.props.executeQuery(query);
  };

  saveQuery = () => {
    this.props.store.modal = "saveQuery";
  };

  deleteQuery = query => {
    this.props.store.deleteQuery;
  };

  toggleSavedQueries = () => {
    this.setState({ savedQueriesIsOpen: !this.state.savedQueriesIsOpen });
  };

  getSelectionText = () => {
    var text = "";
    var activeEl = document.activeElement;
    var activeElTagName = activeEl ? activeEl.tagName.toLowerCase() : null;
    if (
      activeElTagName == "textarea" &&
      typeof activeEl.selectionStart == "number"
    ) {
      text = activeEl.value.slice(
        activeEl.selectionStart,
        activeEl.selectionEnd
      );
    } else if (window.getSelection) {
      text = window.getSelection().toString();
    }

    return this.props.store.selectedText;
  };

  setWorkstationState = (key, val) => {
    this.setState({ [key]: val });
  };

  render() {
    const store = this.props.store;
    const query = store.query; //updates children
    if (!store.databases[0]) {
      return <span />;
    }
    let payloadSize;
    if (store.results && !store.results.error) {
      if (store.results.payload === Object(store.results.payload)) {
        payloadSize = Object.keys(store.results.payload).length;
      } else if (store.results.payload === null) {
        payloadSize = 0;
      } else {
        //primitive payload
        payloadSize = 1;
      }
    }

    const props = {
      store,
      payloadSize,
      execute: this.execute,
      resultsOpen: this.state.resultsOpen,
      setWorkstationState: this.setWorkstationState
    };

    return (
      <div className="Workstation">
        <SideMenu
          savedQueries={this.props.savedQueries}
          deleteQuery={this.deleteQuery}
          savedQueriesIsOpen={this.state.savedQueriesIsOpen}
          toggleSavedQueries={this.toggleSavedQueries}
          {...props}
        />
        <div className="workArea col-md-12">
          <h1 className="workstation-dbTitle">
            {store.currentDatabase.title}
          </h1>
          {/*{store.rootKeys &&
          <div>Root Keys: <ObjectTree value={store.rootKeys} 
          level={0} noValue={true} /><br /></div>}*/}
          <Workbook {...props} height="100%" />
          <ButtonRow
            {...props}
            executingQuery={store.executingQuery}
            saveQuery={this.saveQuery}
            commit={this.props.commit}
            cancelCommit={this.props.cancelCommit}
          />
          <br />
          <div
            className={
              this.state.resultsOpen
                ? "workstation-underWorkbook"
                : "workstation-underWorkbook resultsCollapsed"
            }
          >
            {store.results &&
              store.results.error &&
              <h4 className="queryError">
                {store.results.error}
              </h4>}
            {store.results &&
              payloadSize !== undefined &&
              <QueryResults {...props} />}
            {store.queryHistoryIsOpen &&
              <QueryHistory history={store.getQueryHistory()} {...props} />}
          </div>
        </div>
      </div>
    );
  }
}
