import React from "react";
import store from "../../stores/Store";

const SaveQuery = ({}) => {
  const save = () => {
    const currQuery = store.query.get();
    if (!currQuery) {
      store.modal.set(null);
      return;
    }
    const title = document.getElementById("new-query-name").value;
    const query = { title: title, body: currQuery };
    store.saveQuery(query);
    store.modal.set(null);
  };

  return (
    <div>
      <h4>Save Query</h4> <br />
      Give your query a name: &nbsp;
      <input id="new-query-name" autoFocus type="text" /> <br />
      <br />
      <br />
      <button className="bt blue" onClick={save}>
        Save
      </button>{" "}
      &nbsp;&nbsp;
      <button
        className="bt red"
        onClick={() => {
          store.modal.set(null);
        }}
      >
        Cancel
      </button>
    </div>
  );
};

export default SaveQuery;
