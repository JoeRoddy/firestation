import React from 'react';
import classnames from 'classnames';
import typeName from 'type-name';
import ReactTooltip from 'react-tooltip';
import ValueRow from './ValueRow';
import PropTypes from 'prop-types';
import StringHelper from '../../helpers/StringHelper';
import UpdateHelper from '../../helpers/UpdateHelper';
import admin from 'firebase-admin';

export default class ObjectNode extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.VALUE_EDIT = "FIRESTATION_RESERVED_VALUE_EDIT";
        this.state = {
            opened: props.level > 0,
            keyEdit: false
        };
    }

    componentWillReceiveProps(newProps) {
        if (this.props.value !== newProps.value) {
            this.setState({ opened: newProps.level > 0 });
        }
    }

    toggleNode(e) {
        this.setState({ opened: !this.state.opened });
    }

    render() {
        const { value } = this.props;
        const type = typeName(value);
        return (
            /^(Array|Object)$/.test(type) ? this.renderObject(value, type) :
                /^(number|string|boolean|null)$/.test(type) ? this.renderValue(value, type) :
                    this.renderOther(value, type)
        );
    }

    deleteConfirmation(e,path) {
        e.stopPropagation();
        const confirmationMsg = "warning All data at this location, including nested data, will be permanently deleted: \nData location: " + path;
        if (confirm(confirmationMsg)) {
            UpdateHelper.deleteObject(this.props.store.currentDatabase.config.databaseURL, path);
        }
    }

    addProperty(path, value) {

    }

    renderObject(obj, type) {
        const { path, level, store, fbPath } = this.props;
        const { opened } = this.state;
        const clevel = level > 0 ? level - 1 : 0;
        const that = this;
        let iter =
            type === 'Array' ?
                obj.map((v, i) => ({ prop: i, value: v })) :
                Object.keys(obj).sort(function (a, b) {
                    return a.toLowerCase().localeCompare(b.toLowerCase());
                }).map((prop) => ({ prop, value: obj[prop] }));
        return (
            <div className='object-node'>
                <div className='object-label'>
                    <i onClick={this.toggleNode.bind(this)} className={classnames('toggle-icon', { opened })} data-tip data-for={'data-collapse '+fbPath}/>
                    <ReactTooltip id={'data-collapse '+fbPath} type='dark' effect='solid' place="top">
                            {opened?<span>Collapse</span>:<span>Expand</span>} Data
                    </ReactTooltip>
                    {clevel !== 1 && <span>
                        <i data-tip data-for={'add-child '+fbPath} className="fa fa-plus"></i>
                        <ReactTooltip id={'add-child '+fbPath} type='dark' effect='solid' place="top">
                            Add Property
                    </ReactTooltip>
                        <i onClick={e => this.deleteConfirmation(e,fbPath)} data-tip data-for={'delete-child '+fbPath} className="fa fa-times"></i>
                        <ReactTooltip id={'delete-child '+fbPath} type='dark' effect='solid' place="top">
                            Delete Object
                    </ReactTooltip></span>}
                </div>
                <table style={{ display: opened ? 'block' : 'none' }}>
                    <tbody>
                        {iter.map(({ prop, value }) => {
                            const cpath =
                                type === 'Array' ? `${path}[${prop}]` :
                                    path ? `${path}.${prop}` :
                                        prop;
                            const entireFbPath = that.props.fbPath + "/" + prop;
                            const handleClick = () => {
                                this.setState({ keyEdit: true });
                                this.props.setPathUnderEdit(entireFbPath);
                            }

                            return (
                                <tr key={prop} className='objectNode-tr'>
                                    {this.props.pathUnderEdit && this.props.pathUnderEdit === entireFbPath ?
                                        <th className='prop-name' onClick={e => { e.stopPropagation() }}>
                                            <form onSubmit={that.handleSubmit}>
                                                <input onChange={that.handleChange} type="text" defaultValue={prop}
                                                    autoFocus="autofocus" className="objNode-input" />
                                            </form>
                                            <div className="onClickOutside" onClick={e => this.props.setPathUnderEdit(null)} />
                                        </th>
                                        : <th onClick={handleClick} className='prop-name'>{prop}</th>
                                    }
                                    {!this.props.noValue && <td className='prop-value'>
                                        <ObjectNode store={this.props.store} value={value} path={cpath} fbPath={entireFbPath}
                                            pathUnderEdit={this.props.pathUnderEdit} setPathUnderEdit={this.props.setPathUnderEdit}
                                            level={clevel} key={prop} />
                                        <th>
                                            <i data-tip data-for="delete-child" onClick={e => this.deleteConfirmation(e,entireFbPath)}
                                                className="fa fa-times" aria-hidden="true"></i>
                                            <ReactTooltip id='delete-child' type='dark' effect='solid' place="top">
                                                Delete Property
                                            </ReactTooltip>
                                        </th>
                                    </td>}
                                </tr>);
                        })}
                    </tbody>
                </table>
            </div>
        );
    }

    handleSubmit(e) {
        e.preventDefault();
        var db = admin.app(this.props.store.currentDatabase.url).database();
        let newValue = StringHelper.getParsedValue(this.state.newVal);
        let path = this.props.fbPath;
        const pathUnderEdit = this.props.pathUnderEdit;
        if (pathUnderEdit && this.state.keyEdit) {
            let newObject = this.props.value;
            let oldKey = pathUnderEdit.substring(pathUnderEdit.lastIndexOf("/") + 1);
            newObject[newValue] = newObject[oldKey];
            delete newObject[oldKey];
            newValue = newObject;
        }

        UpdateHelper.set(db, path, newValue);
        this.setState({ newVal: null, keyEdit: false });
        this.props.setPathUnderEdit(null);
    }

    handleChange(e) {
        this.setState({ newVal: e.target.value })
    }

    renderValue(value, type) {
        return (
            <div>
                {
                    this.props.pathUnderEdit === this.props.fbPath + this.props.prop ?
                        <div className='object-node' onClick={this.stopProp} >
                            <form onSubmit={this.handleSubmit}>
                                <input onChange={this.handleChange} type="text" defaultValue={JSON.stringify(value)}
                                    autoFocus="autofocus" className="objNode-input" onClick={e => e.stopPropagation()} />
                                <span className="onClickOutside" onClick={e => this.props.setPathUnderEdit(null)} />
                            </form>
                        </div>
                        :
                        <div className="object-node editable" onClick={e => this.props.setPathUnderEdit(this.props.fbPath + this.props.prop)}>
                            <span className={classnames('object-value', type)} >
                                {JSON.stringify(value)}</span>
                        </div>
                }
            </div>
        );
    }

    renderOther(value, type) {
        return (
            <div className='object-node'>
                <div className='object-label' onClick={this.toggleNode.bind(this)}>
                    {/*<span className='object-type'>{'(' + type + ')'}</span>*/}
                </div>
            </div>
        );
    }
}

ObjectNode.propTypes = {
    value: PropTypes.any.isRequired,
    path: PropTypes.string.isRequired,
    level: PropTypes.number.isRequired
};
