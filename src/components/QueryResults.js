import React from "react";
import PropTypes from "prop-types";
import ReactTooltip from "react-tooltip";
import { observer } from "mobx-react";
import { toJS } from "mobx";

import store from "../stores/Store";
import Tree from "./object_tree/Tree";

const QueryResults = observer(props => {
  const { payload: data, path } = toJS(store.results);

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
          onClick={() => {
            props.setWorkstationState("resultsOpen", !props.resultsOpen);
          }}
        />
      </div>
      {props.payloadSize > 0 && store.results.payload != null && (
        <Tree data={data} rootPath={path} />
      )}
    </div>
  );
});

QueryResults.propTypes = {
  resultsOpen: PropTypes.bool,
  payloadSize: PropTypes.number,
  store: PropTypes.object.isRequired
};

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
      const numInserted =
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

PageBtn.propTypes = {
  backBtn: PropTypes.bool,
  page: PropTypes.number
};

export default QueryResults;
