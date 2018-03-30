import { observable, computed, action } from "mobx";

class TodoStore {
  todos = observable(["get milk"]);
  addTodo = action(todo => {
    this.todos.push(todo);
  });

  dictionaryMap = observable(new Map());

  addDictionaryItem = action((term, definition) => {
    this.dictionaryMap.set(term, definition);
  });
}

const todoStore = new TodoStore();
export default todoStore;
