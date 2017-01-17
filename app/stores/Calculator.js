import { observable, computed, action } from 'mobx';

class AppStore {
    @observable state = {};

    @action changeAppState(newState) {
      this.state = newState;
    }
}

const AppStore = new AppStore();
export default AppStore;
