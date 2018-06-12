import React from "react";
import PropTypes from "prop-types";
import ReactTooltip from "react-tooltip";
import { observer } from "mobx-react";

import store from "../stores/Store";
import { formatDate } from "../helpers/DateHelper";
import StringHelper from "../helpers/StringHelper";
import ObjectTree from "./object_tree/ObjectTree";

const QueryResults = observer(props => {
  return (
    <div className="objectTree-container">
      <div className="results-header">
        <h4>{renderResultsTitle(props.payloadSize, store.results)}</h4>
        <ReactTooltip id="expandTooltip" type="dark" effect="solid" place="top">
          {props.resultsOpen ? "Collapse Results" : "Expand Results"}
        </ReactTooltip>
        <i
          data-tip
          data-for="expandTooltip"
          className={
            "fa fa-" +
            (props.resultsOpen ? "minus" : "plus") +
            "-square-o gray-icon"
          }
          onClick={e => {
            props.setWorkstationState("resultsOpen", !props.resultsOpen);
          }}
        />
      </div>
      {props.payloadSize > 0 &&
        store.results.payload != null && (
          <ObjectTree value={store.results} level={2} {...props} />
        )}
    </div>
  );
});

const renderResultsTitle = (payloadSize, results) => {
  let payloadDescription = payloadSize + ")";
  if (payloadSize > 50) {
    const page = store.resultsPage.get();
    const cap = page + 50 > payloadSize ? payloadSize : page + 50;
    const range = `${page + 1}-${cap} of ${payloadSize}`;
    payloadDescription = (
      <span>
        {range} {page >= 50 && <PageBtn backBtn page={page} />}
        {page + 50 < payloadSize && <PageBtn page={page} />})
      </span>
    );
  }

  switch (results.statementType) {
    case "UPDATE_STATEMENT":
      return <span>Updated Records ({payloadDescription}</span>;
    case "INSERT_STATEMENT":
      let numInserted =
        results.insertCount > 1 ? " (" + results.insertCount + "): " : ": ";
      return "Inserted Records" + numInserted;
    case "DELETE_STATEMENT":
      return <span>Records to Delete ({payloadDescription}</span>;
    default:
      return (
        <span>
          {results.path} ({payloadDescription}
        </span>
      );
  }
};

const PageBtn = ({ backBtn, page }) => {
  let newVal = backBtn ? page - 50 : page + 50;
  newVal = newVal < 0 ? 0 : newVal;
  const tooltipName = `${backBtn ? "back" : "prev"}PgTooltip`;

  return (
    <span>
      <button
        className="bt blue sm"
        onClick={() => store.resultsPage.set(newVal)}
        data-tip
        data-for={tooltipName}
      >
        <icon
          className={`fa fa-chevron-circle-${backBtn ? "left" : "right"}`}
        />{" "}
      </button>
      <ReactTooltip id={tooltipName} type="dark" effect="solid" place="top">
        <span>{backBtn ? "Previous" : "Next"}</span>
      </ReactTooltip>
    </span>
  );
};

QueryResults.propTypes = {
  resultsOpen: PropTypes.bool,
  payloadSize: PropTypes.number,
  store: PropTypes.object.isRequired
};

export default QueryResults;
