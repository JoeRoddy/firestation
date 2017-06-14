import React from 'react';

const FunctionalTemplate = ({ store }) => {
    const save = () => {
        if (!store.query) {
            store.modal = null;
            return;
        }
        const title = document.getElementById("new-query-name").value;
        const query = { title: title, body: store.query };
        store.saveQuery(query);
        store.modal = null;
    }

    return (
        <div>
            <h4>Save Query</h4> <br />
            Give your query a name: &nbsp;
           <input id="new-query-name" autoFocus type="text" /> <br /><br /><br />
            <button className="bt blue" onClick={save}>Save</button> &nbsp;&nbsp;
           <button className="bt red" onClick={e => { store.modal = null }}>Cancel</button>
        </div>
    )
}

export default FunctionalTemplate;