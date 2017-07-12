import React, { Component } from 'react';
import firebase from 'firebase';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';
// import { browserHistory } from 'react-router';
import { observer } from 'mobx-react';
import Workbook from './Workbook';
import ObjectTree from './object_tree/ObjectTree';
import SideMenu from './SideMenu';
import QueryHistory from './QueryHistory';

@observer
export default class Workstation extends Component {
    constructor(props) {
        super(props);
        this.deleteQuery = this.deleteQuery.bind(this);
        this.toggleSavedQueries = this.toggleSavedQueries.bind(this);

        this.execute = this.execute.bind(this);
        this.state = {
            savedQueries: null,
            savedQueriesIsOpen: true,
            modal: null
        }
    }

    componentDidMount() {
        if (!this.props.store.databases[0]) {
            this.props.store.modal = "newDB";
        }
    }

    execute() {
        let selectedText = this.getSelectionText();
        let query = this.props.store.query;
        if (selectedText && query.includes(selectedText)) {
            query = selectedText;
        }
        this.props.executeQuery(query);
    }

    saveQuery() {
        this.props.store.modal = "saveQuery";
    }

    deleteQuery(query) {
        this.props.store.deleteQuery;
    }

    toggleSavedQueries() {
        this.setState({ savedQueriesIsOpen: !this.state.savedQueriesIsOpen });
    }

    getSelectionText() {
        var text = "";
        var activeEl = document.activeElement;
        var activeElTagName = activeEl ? activeEl.tagName.toLowerCase() : null;
        if (
            (activeElTagName == "textarea") &&
            (typeof activeEl.selectionStart == "number")
        ) {
            text = activeEl.value.slice(activeEl.selectionStart, activeEl.selectionEnd);
        } else if (window.getSelection) {
            text = window.getSelection().toString();
        }

        return this.props.store.selectedText;
    }

    getResultsTitle(payloadSize) {
        let payloadDesc = payloadSize>50?"Displaying 50 of "+payloadSize:payloadSize;
        switch (this.props.results.statementType) {
            case "UPDATE_STATEMENT":
                return <span>Updated Records ({payloadDesc}):</span>;
            case "INSERT_STATEMENT":
                return "Inserted Records:";
            case "DELETE_STATEMENT":
                return <span>Records to Delete ({payloadDesc}):</span>;
            default:
                return <span>Records ({payloadDesc}):</span>;
        }

    }

    render() {
        console.log('workstations props:',this.props)
        if (!this.props.store.databases[0]) {
            return <span />;
        }
        let payloadSize;
        if (this.props.results) {
            if (this.props.results.payload === Object(this.props.results.payload)) {
                payloadSize = Object.keys(this.props.results.payload).length;
            } else if (this.props.results.payload === null) {
                payloadSize = 0;
            } else { //primitive payload
                payloadSize = 1;
            }
        }

        const props = {
            store: this.props.store
        }

        return (
            <div className="Workstation">
                <SideMenu savedQueries={this.props.savedQueries}
                    deleteQuery={this.deleteQuery} savedQueriesIsOpen={this.state.savedQueriesIsOpen}
                    toggleSavedQueries={this.toggleSavedQueries} {...props} />
                <div className="workArea col-md-12">
                    <h1 className="workstation-dbTitle">{this.props.currentDatabase.title}</h1>
                    {/*{this.props.rootKeys &&
                        <div>Root Keys: <ObjectTree value={this.props.rootKeys} level={0} noValue={true} /><br /></div>}*/}
                    <Workbook execute={this.execute} {...props} height="100%" />
                    <div className="workstation-btns">
                        {!this.props.commitQuery || !payloadSize ?
                            <button className="bt blue" onClick={this.execute}>Execute</button>
                            :
                            <div>
                                <button className="bt commitbtn" onClick={this.props.commit}>Commit</button>
                                <button className="bt red" onClick={this.props.cancelCommit}>Cancel</button>
                            </div>
                        }
                        <div className="util-btns">
                            {this.props.store.query && <div>
                                <button onClick={this.saveQuery.bind(this)} data-tip data-for='saveTooltip'
                                    className="bt sm"><i className="fa fa-floppy-o" /></button>
                                <ReactTooltip id='saveTooltip' type='dark' effect='solid' place="top">
                                    <span>Save Query</span>
                                </ReactTooltip></div>}
                            <button onClick={e => this.props.store.queryHistoryIsOpen = !this.props.store.queryHistoryIsOpen} data-tip data-for='historyTooltip' className="bt sm white">
                                <i className="fa fa-clock-o" /></button>
                            <ReactTooltip id='historyTooltip' type='dark' effect='solid' place="top">
                                <span>History</span>
                            </ReactTooltip>
                        </div>
                    </div>
                    <br />
                    <div className="workstation-underWorkbook">
                        {this.props.results && payloadSize !== undefined &&
                            <div className="objectTree-container"><h4>{this.getResultsTitle(payloadSize)}</h4>
                                {payloadSize > 0 && this.props.results.payload != null &&
                                    <ObjectTree value={this.props.results} level={payloadSize > 30 ? 1 : 2} {...props} />}
                            </div>
                        }
                        {this.props.store.queryHistoryIsOpen &&
                            <QueryHistory history={this.props.store.getQueryHistory()} {...props} />
                        }
                    </div>
                </div>
            </div>
        )
    }
};
