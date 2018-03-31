export default class CacheHelper {
  static updateLocalStore(key, obj) {
    localStorage.setItem(key, JSON.stringify(obj));
  }

  static getFromLocalStore(key) {
    return JSON.parse(localStorage.getItem(key));
  }
}
