import React, { Component } from 'react';
import ObjectNode from './ObjectNode';

export default class ValueRow extends Component {
    constructor(props) {
        super(props);
        this.state = {
            editing:null
        }
    }

    render() {
        return (
            <tr key={this.props.prop}>
                <th className='prop-name'>{this.props.prop}</th>
                {!this.props.noValue && <td className='prop-value'>
                    <ObjectNode value={this.props.value} path={this.props.cpath} level={this.props.clevel} />
                </td>}
            </tr>
        )
    }
};
