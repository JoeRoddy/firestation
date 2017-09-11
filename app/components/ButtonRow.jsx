import React from "react";
import PropTypes from "prop-types";
import ReactTooltip from "react-tooltip";

const ButtonRow = props => {
  const payloadSize = props.payloadSize;
  const store = props.store;
  return (
    <div className="workstation-btns">
      {!store.commitQuery || !payloadSize
        ? <button className="bt blue" onClick={props.execute}>
            Execute
          </button>
        : <div>
            <button className="bt commitbtn" onClick={props.commit}>
              Commit
            </button>
            <button className="bt red" onClick={props.cancelCommit}>
              Cancel
            </button>
          </div>}
      <div className="util-btns">
        {store.query &&
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
          </div>}
        <button
          onClick={e => (store.queryHistoryIsOpen = !store.queryHistoryIsOpen)}
          data-tips
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
};

ButtonRow.propTypes = {
  payloadSize: PropTypes.number,
  store: PropTypes.object.isRequired,
  execute: PropTypes.func.isRequired,
  commit: PropTypes.func.isRequired,
  cancelCommit: PropTypes.func.isRequired,
  saveQuery: PropTypes.func.isRequired
};

export default ButtonRow;
