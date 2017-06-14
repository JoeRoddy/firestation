import React, { Component } from 'react';
import Workbook from './Workbook';
import ObjectTree from './object_tree/ObjectTree';
import firebase from 'firebase';

export default class Demo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            results: null,
            exampleDb: null,
        }
    }

    componentWillMount() {
        // var config = {
        //     apiKey: "AIzaSyB7y8yaj6yoTgzvO25nQF7NdWNIXn7kbgQ",
        //     authDomain: "dinosaurs-f530b.firebaseapp.com",
        //     databaseURL: "https://dinosaurs-f530b.firebaseio.com",
        //     projectId: "dinosaurs-f530b",
        //     storageBucket: "dinosaurs-f530b.appspot.com",
        //     messagingSenderId: "256288636636"
        // };
        var config = {
            apiKey: "AIzaSyAx1Q-qv4-Z6iHAKgNSIimXP7HgguRrgkM",
            authDomain: "dinosaurs-dev.firebaseapp.com",
            databaseURL: "https://dinosaurs-dev.firebaseio.com",
            projectId: "dinosaurs-dev",
            storageBucket: "dinosaurs-dev.appspot.com",
            messagingSenderId: "696095946254"
        };
        const db = { config: config }
        this.props.startFirebaseForDb(db);
        firebase.database(firebase.app(config.databaseURL)).ref('dinosaurs')
            .once("value", snap => {
                this.setState({ exampleDb: snap.val() })
            });

        this.props.setCurrentDb(db);
    }

    render() {
        const exampleQuery = "select height, nickname from dinosaurs\n   where nickname != 'jim'\n   and tall = false\n   and height > 2\n   and nonExistentProp = null;"

        return (
            <div className="Demo">
                {this.state.exampleDb &&
                    <div>
                        <h3>Example Firebase Collection: "dinosaurs"</h3>
                        <ObjectTree value={this.state.exampleDb} level={2} />
                        <br />
                        <Workbook height={5} executeQuery={this.props.executeQuery} defaultValue={exampleQuery} />
                    </div>
                }
                {this.props.results &&
                    <div><br /><ObjectTree value={this.props.results} level={2} /></div>
                }
            </div>
        )
    }
};
