const { Readable } = require('stream');
const mongoose = require('mongoose');

class MongoStorage {
  constructor(bucketName = 'documentFiles') {
    this.bucketName = bucketName;
  }

  bucket() {
    if (!mongoose.connection.db) {
      throw new Error('MongoDB is not connected');
    }
    return new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: this.bucketName,
    });
  }

  async init() {
    this.bucket();
  }

  async findFiles(key) {
    return this.bucket().find({ filename: key }).toArray();
  }

  async put(key, buffer, contentType) {
    await this.remove(key);
    const upload = this.bucket().openUploadStream(key, {
      contentType,
      metadata: { storageKey: key },
    });
    await new Promise((resolve, reject) => {
      upload.on('error', reject);
      upload.on('finish', resolve);
      Readable.from(buffer).pipe(upload);
    });
    return key;
  }

  async getStream(key) {
    const files = await this.findFiles(key);
    if (!files.length) {
      const err = new Error('File not found');
      err.code = 'ENOENT';
      throw err;
    }
    return this.bucket().openDownloadStreamByName(key);
  }

  async getBuffer(key) {
    const stream = await this.getStream(key);
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }

  async remove(key) {
    const files = await this.findFiles(key);
    await Promise.all(files.map((file) => this.bucket().delete(file._id)));
  }
}

module.exports = { MongoStorage };
