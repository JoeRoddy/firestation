import React from "react";
import PropTypes from "prop-types";
import { formatDate } from "../helpers/DateHelper";
import StringHelper from "../helpers/StringHelper";
import ReactTooltip from "react-tooltip";
import store from "../stores/Store";

const QueryHistory = ({ history }) => {
  const queryTextLimit = 20;
  const query = store.query.get();

  return (
    <div className="QueryHistory">
      <h4>History</h4>
      <div className="histTable-container">
        <table className="table table-bordered table-sm">
          <thead>
            <tr>
              <th>Date</th>
              <th>Query</th>
              <th>Committed</th>
            </tr>
          </thead>
          <tbody>
            {history &&
              history.map((query, i) => {
                return (
                  <tr key={i}>
                    <td>{formatDate(query.date)}</td>
                    <td
                      data-tip
                      data-for={"q-bodyTooltip " + i}
                      className="clickable"
                      onClick={e => store.appendQuery(query.body)}
                    >
                      {query.body.length <= queryTextLimit
                        ? query.body
                        : query.body.substring(0, queryTextLimit - 3) + "..."}
                    </td>
                    <td>{query.committed && <i className="fa fa-check" />}</td>
                    {query.body.length > queryTextLimit && (
                      <ReactTooltip
                        id={"q-bodyTooltip " + i}
                        type="dark"
                        effect="float"
                        place="top"
                      >
                        <span>
                          {StringHelper.getJsxWithNewLines(query.body)}
                        </span>
                      </ReactTooltip>
                    )}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

QueryHistory.propTypes = {
  history: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired
};

export default QueryHistory;
