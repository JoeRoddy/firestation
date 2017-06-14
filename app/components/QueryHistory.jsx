import React from 'react';
import { formatDate } from '../helpers/DateHelper';
import StringHelper from '../helpers/StringHelper';
import ReactTooltip from 'react-tooltip';

const QueryHistory = ({ history, store }) => {
    const queryTextLimit = 62;

    return (
        <div className="QueryHistory">
            <h4>History</h4>
            {history &&
                history.map((query, i) => {
                    return (
                        <div key={i} data-tip data-for={'q-bodyTooltip ' + i}
                            onClick={e => store.appendQuery(query.body)} className="hist-item">
                            <div>
                                {formatDate(query.date)} -- {query.body.substring(0, queryTextLimit)}
                            </div>
                            {query.body.length > queryTextLimit &&
                                <ReactTooltip id={'q-bodyTooltip ' + i} type='dark' effect='float' place="top">
                                    <span>{StringHelper.getJsxWithNewLines(query.body)}</span>
                                </ReactTooltip>
                            }
                        </div>
                    )
                })
            }
        </div>
    )
}

export default QueryHistory;