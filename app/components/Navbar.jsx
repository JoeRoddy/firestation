import React from 'react';
// import { Link, browserHistory } from 'react-router';
import PropTypes from 'prop-types';

const Navbar = ({ currentRoute, databases, currentDatabase, setCurrentDb, routing, store }) => {
    // const { location, push, goBack } = routing;

    const selectDb = (db) => {
        setCurrentDb(db);
        // browserHistory.push('/workstation');
    }

    const renderDatabases = () => {
        if (!databases) { return null; }
        return databases.map((db, index) => {
            return <a className="dropdown-item" onClick={e => selectDb(db)} key={index}>{db.title}</a>;
        })
    }

    const getDatabaseJsx = () => {
        if (!databases) {
            return <li className={"nav-db "}><a onClick={e=>store.modal="newDB"}>Add Your DB</a></li>
        } else {
            return (
                <li className="nav-item dropdown">
                    <a className="nav-link dropdown-toggle" id="navbarDropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        {(currentDatabase && currentDatabase.title) ?
                            currentDatabase.title : "Databases"}
                    </a>
                    <div className="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
                        <a className="dropdown-item" onClick={e=>store.modal="newDB"}>Add New DB</a>
                        <div className="dropdown-divider"></div>
                        {renderDatabases()}
                    </div>
                </li>
            )
        }
    }

    return (
        <nav className="navbar fixed-top navbar-toggleable-xl navbar-inverse bg-primary">
            <a className="navbar-brand" onClick={e=>{}}>
                <img src="https://lh3.googleusercontent.com/-whXBCDVxIto/Vz2Rsyz-UjI/AAAAAAAAiJc/UjvR-M2b9tY5SyKFkDY6Q_MbusEINRXkQ/w1024-h1024/Firebase_16-logo.png" alt="" />
                <span>FireStation</span></a>
            <div className="navbar-collapse collapse">
                <ul className="navbar-nav">
                    {getDatabaseJsx()}
                </ul>
            </div>
        </nav>
    )
}

Navbar.propTypes = { currentRoute: PropTypes.string };
Navbar.defaultProps = { currentRoute: 'root' };

export default Navbar;