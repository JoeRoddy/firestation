import React, { Component } from "react";
import ReactTooltip from "react-tooltip";
import { observer } from "mobx-react";
import Workbook from "./Workbook";
import ObjectTree from "./object_tree/ObjectTree";
import SideMenu from "./SideMenu";
import QueryHistory from "./QueryHistory";

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

  getResultsTitle = payloadSize => {
    let payloadDesc =
      payloadSize > 50 ? "Displaying 50 of " + payloadSize : payloadSize;
    switch (this.props.store.results.statementType) {
      case "UPDATE_STATEMENT":
        return (
          <span>
            Updated Records ({payloadDesc}):
          </span>
        );
      case "INSERT_STATEMENT":
        return "Inserted Records:";
      case "DELETE_STATEMENT":
        return (
          <span>
            Records to Delete ({payloadDesc}):
          </span>
        );
      default:
        return (
          <span>
            Records ({payloadDesc}):
          </span>
        );
    }
  };

  render() {
    const store = this.props.store;
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
      store: store,
      resultsOpen: this.state.resultsOpen
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
                        <div>Root Keys: <ObjectTree value={store.rootKeys} level={0} noValue={true} /><br /></div>}*/}
          <Workbook execute={this.execute} {...props} height="100%" />
          <div className="workstation-btns">
            {!store.commitQuery || !payloadSize
              ? <button className="bt blue" onClick={this.execute}>
                  Execute
                </button>
              : <div>
                  <button className="bt commitbtn" onClick={this.props.commit}>
                    Commit
                  </button>
                  <button className="bt red" onClick={this.props.cancelCommit}>
                    Cancel
                  </button>
                </div>}
            <div className="util-btns">
              {store.query &&
                <div>
                  <button
                    onClick={this.saveQuery.bind(this)}
                    data-tip
                    data-for="saveTooltip"
                    className="bt sm"
                  >
                    <i className="fa fa-floppy-o" />
                  </button>
                  <ReactTooltip
                    id="saveTooltip"
                    type="dark"
                    effect="solid"
                    place="top"
                  >
                    <span>Save Query</span>
                  </ReactTooltip>
                </div>}
              <button
                onClick={e =>
                  (store.queryHistoryIsOpen = !store.queryHistoryIsOpen)}
                data-tip
                data-for="historyTooltip"
                className="bt sm white"
              >
                <i className="fa fa-clock-o" />
              </button>
              <ReactTooltip
                id="historyTooltip"
                type="dark"
                effect="solid"
                place="top"
              >
                <span>History</span>
              </ReactTooltip>
            </div>
          </div>
          <br />
          <div className="workstation-underWorkbook">
            {store.results &&
              store.results.error &&
              <h4 className="queryError">
                {store.results.error}
              </h4>}
            {store.results &&
              payloadSize !== undefined &&
              <div className="objectTree-container">
                <div className="results-header">
                  <h4>
                    {this.getResultsTitle(payloadSize)}
                  </h4>
                  <button
                    onClick={e => {
                      this.setState({ resultsOpen: !this.state.resultsOpen });
                    }}
                  >
                    {this.state.resultsOpen ? "Collapse" : "Expand"}
                  </button>
                </div>
                {payloadSize > 0 &&
                  store.results.payload != null &&
                  <ObjectTree value={store.results} level={2} {...props} />}
              </div>}
            {store.queryHistoryIsOpen &&
              <QueryHistory history={store.getQueryHistory()} {...props} />}
          </div>
        </div>
      </div>
    );
  }
}
