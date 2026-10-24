const request = require('supertest');
const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { createApp } = require('../src/app');
const { connectDb, disconnectDb } = require('../src/config/db');
const { setStorage } = require('../src/services/storage');
const { MongoStorage } = require('../src/services/storage/MongoStorage');
const { hashPassword } = require('../src/utils/crypto');
const { env } = require('../src/config/env');
const User = require('../src/models/User');

let mongo;

async function setupApp() {
  mongo = await MongoMemoryServer.create();
  await connectDb(mongo.getUri());
  setStorage(new MongoStorage());
  return createApp();
}

async function teardownApp() {
  await mongoose.connection.dropDatabase();
  await disconnectDb();
  if (mongo) await mongo.stop();
}

async function createUser(overrides = {}) {
  const email = (overrides.email || `user-${Date.now()}@company.com`).toLowerCase();
  return User.create({
    name: overrides.name || 'Test User',
    email,
    passwordHash: await hashPassword(overrides.password || 'Password123!@#'),
    role: overrides.role || 'employee',
    employeeId: overrides.employeeId,
    department: overrides.department || 'QA',
    isActive: overrides.isActive !== undefined ? overrides.isActive : true,
  });
}

async function login(app, email, password = 'Password123!@#') {
  const res = await request(app).post('/api/auth/login').send({ email, password });
  return res;
}

function expiredToken(user) {
  return jwt.sign(
    { sub: String(user._id), role: user.role, tv: user.tokenVersion },
    env.jwt.accessSecret,
    { expiresIn: '-10s', issuer: env.jwt.issuer, audience: env.jwt.audience }
  );
}

function invalidToken() {
  return jwt.sign({ sub: 'x', role: 'employee', tv: 0 }, 'wrong-secret', {
    expiresIn: '10m',
    issuer: env.jwt.issuer,
    audience: env.jwt.audience,
  });
}

function sampleFile(name = 'policy.txt', contents = 'confidential policy text') {
  return { name, contents };
}

module.exports = {
  setupApp,
  teardownApp,
  createUser,
  login,
  expiredToken,
  invalidToken,
  sampleFile,
};
