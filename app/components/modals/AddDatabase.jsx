import React from 'react';
import PropTypes from 'prop-types';
import { convertJsonToDbConfig } from '../../helpers/JsonHelper';
import { shell } from 'electron';

const AddDatabase = ({ store, createDb, serviceAccount, handleFile }) => {
    const save = () => {
        let serviceKey = store.newDb.data;
        if(!serviceKey){
            alert("Something went wrong with your file.");
            return;
        }
        let title = document.getElementById("db-title-input").value;
        title = title ? title : "My Firebase DB";
        let path = store.newDb.path;
        path = path.substring(path.lastIndexOf("/")+1);
        const database = {
            title: title,
            serviceKey: serviceKey,
            url: "https://"+serviceKey.project_id+".firebaseio.com",
            path: path
        }

        const errMsg = createDb(database);
        if (errMsg) {
            alert(errMsg);
        } else{
            store.newDb = null;
        }
    };

    const toggleServiceAccount = () => {
        console.log("called")
        let modal = serviceAccount ? "newDB" : "newDB service";
        console.log("flipping:", modal)
        store.modal = modal;
    }

    const clearNewDb = () => {
        store.newDb = null;
    }

    const configPlaceholder = 'var config = {\n\tapiKey: "apiKey",\n\tauthDomain: "projectId.firebaseapp.com",\n\tdatabaseURL: "https://databaseName.firebaseio.com",\n\tstorageBucket: "bucket.appspot.com"\n};'

    return (
        <div className="AddDatabase row justify-content-md-center">
            <div className="col-md-auto">
                <h2>Add a Firebase Database</h2> <br />
                {/*<div>
                    <h5>
                        <label className="switch">
                            <input onChange={toggleServiceAccount}
                                checked={serviceAccount} type="checkbox" />
                            <div className="slider round"></div>
                        </label><span>Service Account<small>(necessary to bypass security rules)</small></span></h5>
                </div>
                {!serviceAccount &&
                    <div>
                        <p>1) <a href="https://console.firebase.google.com/" target="_blank">Select your project on Firebase</a></p>
                        <p>2) Select "Add Firebase to your web app"</p>
                        <p>3) Copy config script</p>
                        <br />
                        <br />
                        <input type="text" id="db-title-input" placeholder="Database Name" /> <br /><br />
                        <textarea name="" id="config-details" cols="60" rows="10" placeholder={configPlaceholder}></textarea>
                        <br />
                    </div>
                }
                {serviceAccount &&*/}
                <div>
                    <p>1) <a onClick={e => shell.openExternal('https://console.firebase.google.com/u/0/project/_/settings/serviceaccounts/adminsdk')}>
                        Select your project on Firebase</a></p>
                    <p>2) Select "GENERATE NEW PRIVATE KEY"</p>
                    <p>3) Import the key into Firestation</p>
                    <div>
                        <button onClick={handleFile} className="bt white">
                            <i className="fa fa-file-text-o" /> Import Key</button>
                        <span className=""><i>Note:</i> this key <b>never</b> leaves your machine</span>
                    </div>
                    {store.newDb &&
                        <div className="detailText"><br />{store.newDb.path} <i className="fa fa-times" onClick={clearNewDb}></i></div>
                    }
                    <br />
                    <br />
                    <input type="text" id="db-title-input" placeholder="Database Name" /> <br /><br />
                </div>
                {/*}*/}

                <button className="bt blue" onClick={save}>Save</button>
            </div>
        </div>
    )
}

export default AddDatabase;