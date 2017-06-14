import React from 'react';
import { observer } from 'mobx-react';
const remote = require('electron').remote;

@observer
export default class App extends React.Component {
  changeName(){
    let name = this.props.store.name === "ling" ? "joe" : "ling";
    this.props.store.name = name;
  }

  render() {
    const { height, width } = remote.getCurrentWindow().getBounds();
    return (
      <div>
        <span>hello world {this.props.store.name}</span>
        <button onClick={this.changeName.bind(this)}> change name</button>
      </div>
    );
  }
}
