import React from 'react';
import PropTypes from 'prop-types';
import {convertJsonToDbConfig} from '../helpers/JsonHelper';

const AddDatabase = ({ createDb }) => {
    const save = () => {
        let details = document.getElementById("config-details").value;
        const config = convertJsonToDbConfig(details);
        let title = document.getElementById("db-title-input").value;
        title = title ? title : "My Firebase DB";
        const database = {
            title: title,
            config: config
        }

        const errMsg = createDb(database);
        if (errMsg) {
            alert(errMsg);
        }
    };

    const configPlaceholder = 'var config = {\n\tapiKey: "apiKey",\n\tauthDomain: "projectId.firebaseapp.com",\n\tdatabaseURL: "https://databaseName.firebaseio.com",\n\tstorageBucket: "bucket.appspot.com"\n};'

    return (

        <div className="AddDatabase row justify-content-md-center">
            <div className="col-md-auto">
                <h2>Add a Firebase Database</h2> <br />
                <p>1) <a href="https://console.firebase.google.com/" target="_blank">Select your project on Firebase</a></p>
                <p>2) Select "Add Firebase to your web app"</p>
                <p>3) Copy config script</p>
                <br />
                <br />
                <input type="text" id="db-title-input" placeholder="Database Name" /> <br /><br />
                <textarea name="" id="config-details" cols="60" rows="10" placeholder={configPlaceholder}></textarea>
                <br />
                <button className="bt blue" onClick={save}>Save</button>
            </div>

        </div>
    )
}

export default AddDatabase;