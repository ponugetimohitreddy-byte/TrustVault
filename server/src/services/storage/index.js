const { MongoStorage } = require('./MongoStorage');

let instance;

function getStorage() {
  if (!instance) {
    instance = new MongoStorage();
  }
  return instance;
}

function setStorage(storage) {
  instance = storage;
}

module.exports = { getStorage, setStorage };
