import React from 'react';
import { observer } from 'mobx-react';

@observer
export default class App extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div>Hello World</div>
    );
  }
}
