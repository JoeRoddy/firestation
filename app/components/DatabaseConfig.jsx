import React from 'react';
import {convertJsonToDbConfig} from '../helpers/JsonHelper';

const DatabaseConfig = ({currentDatabase, store}) => {
    const save = () => {
        let details = document.getElementById("config-details").value;
        const config = convertJsonToDbConfig(details);
        let title = document.getElementById("db-title-input").value;
        title = title ? title : "My Firebase DB";
        const database = {
            title: title,
            config: config
        }

        let errMsg = store.updateDatabase(database);
        if (errMsg) {
            alert(errMsg);
        } else{
            store.modal = null;
        }
    }

    return (
        <div className="DatabaseConfig">
            <div className="col-md-auto">
                <h2>DB: {currentDatabase.title}</h2> <br />
                <input type="text" id="db-title-input" defaultValue={currentDatabase.title} /> <br /><br />
                <textarea spellCheck="false" name="" id="config-details" cols="60" rows="10" defaultValue={JSON.stringify(currentDatabase.config,null,4)}></textarea>
                <br />
                <button className="bt blue" onClick={save}>Save</button>
            </div>
        </div>
    )
}

export default DatabaseConfig;