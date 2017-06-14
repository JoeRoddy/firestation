import React from 'react';
import Demo from './Demo'

const Landing = (props) => {
    return (
        <div className="Landing  row justify-content-center">
            <div className="col-10">
                <h1>Query. Debug. Extinguish.</h1>
                <Demo {...props} />
            </div>
        </div>
    )
}

export default Landing;