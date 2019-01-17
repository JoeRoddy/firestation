import React from "react";
import PropTypes from "prop-types";
import ReactTooltip from "react-tooltip";
import { observer } from "mobx-react";

import store from "../stores/Store";

const ButtonRow = observer(props => {
  const payloadSize = props.payloadSize;
  const query = store.query.get();
  return (
    <div className="workstation-btns">
      {!store.commitQuery.get() || !payloadSize ? (
        <button
          className="bt blue"
          onClick={props.execute}
          disabled={props.executingQuery}
        >
          {props.executingQuery ? (
            <i className="fa fa-circle-o-notch fa-spin" />
          ) : (
            "Execute"
          )}
        </button>
      ) : (
        <div>
          <button className="bt commitbtn" onClick={props.commit}>
            Commit
          </button>
          <button className="bt red" onClick={props.cancelCommit}>
            Cancel
          </button>
        </div>
      )}
      <div className="util-btns">
        {query && (
          <div>
            <button
              onClick={props.saveQuery}
              data-tip
              data-for="saveTooltip"
              className="bt sm"
            >
              <i className="fa fa-floppy-o" />
            </button>
            <ReactTooltip
              id="saveTooltip"
              type="dark"
              effect="solid"
              place="top"
            >
              <span>Save Query</span>
            </ReactTooltip>
          </div>
        )}
        <button
          onClick={store.toggleQueryHistory}
          data-tip
          data-for="historyTooltip"
          className="bt sm white"
        >
          <i className="fa fa-clock-o" />
        </button>
        <ReactTooltip
          id="historyTooltip"
          type="dark"
          effect="solid"
          place="top"
        >
          <span>History</span>
        </ReactTooltip>
      </div>
    </div>
  );
});

ButtonRow.propTypes = {
  payloadSize: PropTypes.number,
  store: PropTypes.object.isRequired,
  execute: PropTypes.func.isRequired,
  commit: PropTypes.func.isRequired,
  cancelCommit: PropTypes.func.isRequired,
  saveQuery: PropTypes.func.isRequired,
  executingQuery: PropTypes.bool.isRequired
};

export default ButtonRow;
