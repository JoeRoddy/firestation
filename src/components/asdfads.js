import React, { Component } from "react";
import { observer } from "mobx-react";

import { getUsers, getStore } from "../fire";
import todoStore from "../stores/TodoStore";

@observer
export default class App extends Component {
  state = {
    count: 0,
    inputVal: "",
    users: null
  };

  componentWillMount() {
    getUsers(users => {
      this.setState({ users });
    });
    getStore();
  }

  addTodo = () => {
    todoStore.addTodo(this.state.inputVal);
    this.setState({ inputVal: "" });
  };

  render() {
    const todos = todoStore.todos;

    return (
      <div className="App">
        react app
        <div className="alert alert-primary" role="alert">
          This is a primary alert—check it out!
        </div>
        <br /> count: {this.state.count} <br />
        <button onClick={e => this.setState({ count: this.state.count + 1 })}>
          {" "}
          Increment count
        </button>
        <h3>todos</h3>
        <input
          value={this.state.inputVal}
          placeholder="New todo"
          onChange={e => this.setState({ inputVal: e.target.value })}
        />
        <button onClick={this.addTodo}> add todo</button>
        {todos && todos.map((todo, i) => <div key={i}>{todo} </div>)}
        <h3>
          {this.state.users &&
            Object.keys(this.state.users).map(userId => {
              return (
                <div key={userId}>
                  {this.state.users[userId].email}
                  <br />
                </div>
              );
            })}
        </h3>
      </div>
    );
  }
}
