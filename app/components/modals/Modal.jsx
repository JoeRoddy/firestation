import React from 'react';
import AddDatabase from './AddDatabase';
import DatabaseConfig from './DatabaseConfig';
import SaveQuery from './SaveQuery';
import fs from 'fs';
const { dialog } = require('electron').remote

const Modal = ({ store, currentDatabase, createDb }) => {
    let serviceAccount = store.modal.includes("service") ? true : false;

    const handleFile = () => {
        dialog.showOpenDialog(fileNames => {
            console.log(fileNames);
            if (fileNames === undefined) {
                console.log("No file selected");
                return;
            } else if (fileNames.length > 1) {
                alert("Select only one file.");
                return;
            }
            fs.readFile(fileNames[0], 'utf-8', (err, data) => {
                if (err) {
                    alert("An error ocurred reading the file :" + err.message);
                    return;
                }
                store.newDb = { path: fileNames[0], data: JSON.parse(data) };
            });
        });
    }

    const closeModal = () => {
        store.modal = null;
        store.newDb = null;
    }

    return (
        <div className="Modal col-md-12" onClick={closeModal}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <i className="fa fa-times closeBtn" onClick={closeModal} />
                {store.modal.includes("config") &&
                    <DatabaseConfig store={store} closeModal={closeModal} handleFile={handleFile} serviceAccount={serviceAccount} currentDatabase={currentDatabase} />}
                {store.modal.includes("newDB") &&
                    <AddDatabase store={store} createDb={createDb} handleFile={handleFile} serviceAccount={serviceAccount} />}
                {store.modal === "saveQuery" &&
                    <SaveQuery store={store} />
                }
            </div>
        </div>
    )
}

export default Modal;