import React from 'react';

const FunctionalTemplate = ({prop1,prop2}) => {
    const myFunc = () => alert("hi");

    return (
        <div>
            <button onClick={myFunc}>sayhi</button>
        </div>
    )
}

export default FunctionalTemplate;