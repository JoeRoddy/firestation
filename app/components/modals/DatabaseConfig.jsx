import React from 'react';

const DatabaseConfig = ({currentDatabase, store, handleFile, closeModal}) => {
    const save = () => {
        let serviceKey = store.newDb.data;
        if(!serviceKey){
            alert("Something went wrong with your file.");
            return;
        }
        
        let title = document.getElementById("db-title-input").value;
        title = title ? title : store.currentDatabase.title;
        let path = store.newDb.path;
        path = path.substring(path.lastIndexOf("/")+1);
        let database = store.currentDatabase;
        database.title = title;
        database.serviceKey = serviceKey;
        database.url = "https://"+serviceKey.project_id+".firebaseio.com",
        database.path = path;
  
        let errMsg = store.updateDatabase(database);
        if (errMsg) {
            alert(errMsg);
        } else{
            store.modal = null;
        }
    }

    const clearNewDb = () => {
        store.newDb = null;
    }

    return (
        <div className="DatabaseConfig">
            <div className="col-md-auto">
                <h2>DB: {currentDatabase.title}</h2> <br />
                <div className="nameEdit">
                <h4>Name:</h4>
                <input type="text" id="db-title-input" defaultValue={currentDatabase.title} /> <br /><br />
                </div>
                <div className="serviceAcctEdit">                        
                        <button onClick={handleFile} className="bt white">
                            <i className="fa fa-file-text-o" /> New Key</button>
                        { store.newDb ?
                        <div>New Service Account: <span className="detailText"><br />{store.newDb.path}</span></div>
                        :
                        <div>Current Service Account: <span className="detailText"><br />{currentDatabase.path}</span></div>
                        }
                        
                    </div> <br/>
                <button className="bt blue" onClick={save}>Save</button>
                <button className="bt red" onClick={closeModal}>Cancel</button>
            </div>
        </div>
    )
}

export default DatabaseConfig;