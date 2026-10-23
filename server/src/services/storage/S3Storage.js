const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { env } = require('../../config/env');

class S3Storage {
  constructor() {
    this.bucket = env.storage.s3Bucket;
    this.client = new S3Client({
      region: env.storage.awsRegion,
      credentials:
        env.storage.awsAccessKeyId && env.storage.awsSecretAccessKey
          ? {
              accessKeyId: env.storage.awsAccessKeyId,
              secretAccessKey: env.storage.awsSecretAccessKey,
            }
          : undefined,
    });
  }

  async init() {
    if (!this.bucket) {
      throw new Error('S3_BUCKET is required when STORAGE_DRIVER=s3');
    }
  }

  async put(key, buffer, contentType) {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        ServerSideEncryption: env.storage.s3KmsKeyId ? 'aws:kms' : 'AES256',
        SSEKMSKeyId: env.storage.s3KmsKeyId || undefined,
      })
    );
    return key;
  }

  async getStream(key) {
    const res = await this.client.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: key })
    );
    return res.Body;
  }

  async remove(key) {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }
}

module.exports = { S3Storage };
