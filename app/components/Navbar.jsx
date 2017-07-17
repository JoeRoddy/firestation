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
                    <img src="https://lh3.googleusercontent.com/-whXBCDVxIto/Vz2Rsyz-UjI/AAAAAAAAiJc/UjvR-M2b9tY5SyKFkDY6Q_MbusEINRXkQ/w1024-h1024/Firebase_16-logo.png" alt="" />
                    <span>FireStation</span></a>
                <div className="navbar-collapse collapse">
                    <ul className="navbar-nav">
                        {this.getDatabaseJsx()}
                    </ul>
                </div>
            </nav>
        )
    }
}