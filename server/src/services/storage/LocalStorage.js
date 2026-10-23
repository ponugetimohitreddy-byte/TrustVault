const fs = require('fs/promises');
const path = require('path');
const { env } = require('../../config/env');

class LocalStorage {
  constructor(rootDir = env.storage.localDir) {
    this.rootDir = rootDir;
  }

  async init() {
    await fs.mkdir(this.rootDir, { recursive: true });
  }

  fullPath(key) {
    const resolved = path.resolve(this.rootDir, key);
    if (!resolved.startsWith(path.resolve(this.rootDir))) {
      throw new Error('Invalid storage key');
    }
    return resolved;
  }

  async put(key, buffer, _contentType) {
    const dest = this.fullPath(key);
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.writeFile(dest, buffer);
    return key;
  }

  async getStream(key) {
    const dest = this.fullPath(key);
    const { createReadStream } = require('fs');
    await fs.access(dest);
    return createReadStream(dest);
  }

  async getBuffer(key) {
    return fs.readFile(this.fullPath(key));
  }

  async remove(key) {
    try {
      await fs.unlink(this.fullPath(key));
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }
  }
}

module.exports = { LocalStorage };
