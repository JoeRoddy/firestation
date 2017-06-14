import React from 'react';
import AddDatabase from './AddDatabase';
import DatabaseConfig from './DatabaseConfig';

const Modal = ({ store, currentDatabase, createDb}) => {  
    
    return (
        <div className="Modal col-md-12" onClick={e=>store.modal = null}>
            <div className="modal-content" onClick={e=>e.stopPropagation()}>
                <i className="fa fa-times closeBtn" onClick={e=>store.modal = null} />
                {store.modal === "config" &&
                    <DatabaseConfig store={store} currentDatabase={currentDatabase}/>}
                {store.modal === "newDB" && 
                 <AddDatabase createDb={createDb}/>}
            </div>
        </div>
    )
}

export default Modal;