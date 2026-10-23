const { env } = require('../../config/env');
const { LocalStorage } = require('./LocalStorage');
const { S3Storage } = require('./S3Storage');

let instance;

function getStorage() {
  if (!instance) {
    instance = env.storage.driver === 's3' ? new S3Storage() : new LocalStorage();
  }
  return instance;
}

function setStorage(storage) {
  instance = storage;
}

module.exports = { getStorage, setStorage };
