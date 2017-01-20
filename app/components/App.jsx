import React from 'react';
import { observer } from 'mobx-react';
const remote = require('electron').remote;

@observer
export default class App extends React.Component {
  render() {
    const { height, width } = remote.getCurrentWindow().getBounds();
    return (
      <div style={{ height: height - 25, width: width, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <marquee><pre>Hello World!</pre></marquee>
        <marquee><pre>    Hello World!</pre></marquee>
        <marquee><pre>        Hello World!</pre></marquee>
        <marquee><pre>            Hello World!</pre></marquee>
        <marquee><pre>                Hello World!</pre></marquee>
        <marquee><pre>                    Hello World!</pre></marquee>
        <marquee><pre>                        Hello World!</pre></marquee>
        <marquee><pre>                            Hello World!</pre></marquee>
        <marquee><pre>                                Hello World!</pre></marquee>
        <marquee><pre>                                    Hello World!</pre></marquee>
        <marquee><pre>                                        Hello World!</pre></marquee>
        <marquee><pre>                                            Hello World!</pre></marquee>
        <marquee><pre>                                                Hello World!</pre></marquee>
        <marquee><pre>                                                    Hello World!</pre></marquee>
        <marquee><pre>                                                        Hello World!</pre></marquee>
        <marquee><pre>                                                            Hello World!</pre></marquee>
        <marquee><pre>                                                                Hello World!</pre></marquee>
        <marquee><pre>                                                                    Hello World!</pre></marquee>
        <marquee><pre>                                                                        Hello World!</pre></marquee>
        <marquee><pre>                                                                            Hello World!</pre></marquee>
      </div>
    );
  }
}
