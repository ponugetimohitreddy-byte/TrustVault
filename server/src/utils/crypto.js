const crypto = require('crypto');
const bcrypt = require('bcryptjs');

async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

async function verifyPassword(hash, password) {
  try {
    return await bcrypt.compare(password, hash);
  } catch {
    return false;
  }
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function randomToken() {
  return crypto.randomBytes(48).toString('hex');
}

function csrfToken() {
  return crypto.randomBytes(24).toString('hex');
}

module.exports = { hashPassword, verifyPassword, hashToken, randomToken, csrfToken };
