import React from "react";
import classnames from "classnames";
import PropTypes from "prop-types";
import { observer } from "mobx-react";

import store from "../../stores/Store";
import ObjectNode from "./ObjectNode";
import { subObject } from "../../helpers/ObjectHelper";

/**
 * https://github.com/stomita/react-object-tree/
 */
class ObjectTree extends React.Component {
  state = {
    pathUnderEdit: null,
    creationPath: null
  };

  setPathUnderEdit = pathUnderEdit => {
    this.setState({ pathUnderEdit, creationPath: null });
  };

  setCreationPath = creationPath => {
    this.setState({ creationPath, pathUnderEdit: null });
  };

  render() {
    const { className, value, level, noValue } = this.props;
    if (!value || value.payload == undefined) {
      //^ payload can be false
      return <span />;
    }

    const page = store.resultsPage.get();
    const resultsToDisplayInTree = subObject(value.payload, page, page + 50);
    const props = {
      value: resultsToDisplayInTree,
      path: "",
      pathUnderEdit: this.state.pathUnderEdit,
      setPathUnderEdit: this.setPathUnderEdit,
      creationPath: this.state.creationPath,
      setCreationPath: this.setCreationPath,
      fbPath: value.path,
      level: level,
      noValue: noValue
    };

    return (
      <div className="ObjectTree">
        <div className={classnames("object-tree", className)} id="object-tree">
          {this.props.resultsOpen && <ObjectNode {...props} />}
        </div>
      </div>
    );
  }
}

ObjectTree.propTypes = {
  className: PropTypes.string,
  noValue: PropTypes.bool,
  resultsOpen: PropTypes.bool
};

export default observer(ObjectTree);

ObjectTree.propTypes = {
  value: PropTypes.any.isRequired,
  level: PropTypes.number
};

ObjectTree.defaultProps = {
  level: 0
};
