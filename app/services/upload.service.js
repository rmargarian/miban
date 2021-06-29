'use strict';

/**
 * Class stores uploaded from excel file users
 */
class Uploader {
  constructor() {
    this._users = [];
  }
  set users(users) {
    this._users = users;
  }
  get users() {
    return this._users;
  }
}

class Singleton {

  constructor() {
      if (!Singleton.instance) {
          Singleton.instance = new Uploader();
      }
  }

  getInstance() {
      return Singleton.instance;
  }

}
module.exports = Singleton;
