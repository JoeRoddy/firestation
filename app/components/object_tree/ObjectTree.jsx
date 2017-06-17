import React from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import ObjectNode from './ObjectNode';
/**
 * https://github.com/stomita/react-object-tree/
 */
export default class ObjectTree extends React.Component {
  constructor(props) {
    super(props);
    this.setPathUnderEdit = this.setPathUnderEdit.bind(this);
    this.setCreationPath = this.setCreationPath.bind(this);
    this.state = {
      pathUnderEdit: null,
      creationPath: null
    }
  }

  setPathUnderEdit(pathUnderEdit) {
    this.setState({ pathUnderEdit, creationPath: null });
  }

  setCreationPath(creationPath) {
    this.setState({ creationPath, pathUnderEdit: null });
  }

  render() {
    const { className, value, level, noValue, store } = this.props;
    if (!value || value.payload == undefined) { return <span /> }
    const props = {
      value: value.payload,
      path: '',
      pathUnderEdit: this.state.pathUnderEdit,
      setPathUnderEdit: this.setPathUnderEdit,
      creationPath: this.state.creationPath,
      setCreationPath: this.setCreationPath,
      fbPath: value.path,
      level: level,
      noValue: noValue,
      store: store
    }

    return (
      <div className="ObjectTree">
        <div className={classnames('object-tree', className)} id="object-tree">
          <ObjectNode {...props} />
        </div>
      </div>
    );
  }
}

ObjectTree.propTypes = {
  value: PropTypes.any.isRequired,
  level: PropTypes.number
};

ObjectTree.defaultProps = {
  level: 0
};