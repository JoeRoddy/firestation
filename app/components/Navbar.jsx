import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';

@observer
export default class Navbar extends Component {
    renderDatabases = () => {
        if (!this.props.store.databases) { return null; }
        return this.props.store.databases.map((db, index) => {
            return <a className="dropdown-item" onClick={e => this.props.setCurrentDb(db)} key={index}>{db.title}</a>;
        })
    }

    getDatabaseJsx = () => {
        const { store } = this.props;
        if (!store.databases) {
            return <li className={"nav-db "}><a onClick={e => store.modal = "newDB"}>Add Your DB</a></li>
        } else {
            return (
                <li className="nav-item dropdown">
                    <a className="nav-link dropdown-toggle" id="navbarDropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        {(store.currentDatabase && store.currentDatabase.title) ?
                            store.currentDatabase.title : "Databases"}
                    </a>
                    <div className="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
                        <a className="dropdown-item" onClick={e => store.modal = "newDB"}>Add New DB</a>
                        <div className="dropdown-divider"></div>
                        {this.renderDatabases()}
                    </div>
                </li>
            )
        }
    }

    render() {
        return (
            <nav className="navbar fixed-top navbar-toggleable-xl navbar-inverse bg-primary">
                <a className="navbar-brand" onClick={e => { }}>
                    <img src="https://firebasestorage.googleapis.com/v0/b/firestation-e149d.appspot.com/o/logo.ico?alt=media&token=7d5634ac-d956-42a8-8942-60bdeb21c06b" alt="" />
                    <span> &nbsp;FireStation</span></a>
                <div className="navbar-collapse collapse">
                    <ul className="navbar-nav">
                        {this.getDatabaseJsx()}
                    </ul>
                </div>
            </nav>
        )
    }
}