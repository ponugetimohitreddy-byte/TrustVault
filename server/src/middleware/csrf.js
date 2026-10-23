const { AppError } = require('../utils/AppError');
const { CSRF_COOKIE } = require('../services/tokenService');

const SAFE = new Set(['GET', 'HEAD', 'OPTIONS']);

const AUTH_EXEMPT = new Set(['/api/auth/login', '/api/auth/refresh', '/api/auth/logout']);

function csrfProtection(req, res, next) {
  if (SAFE.has(req.method)) return next();
  if (AUTH_EXEMPT.has(req.path)) return next();
  if ((req.get('authorization') || '').startsWith('Bearer ')) return next();

  const cookieToken = req.cookies?.[CSRF_COOKIE];
  const headerToken = req.get('x-csrf-token');
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return next(new AppError(403, 'Invalid CSRF token', 'CSRF'));
  }
  next();
}

module.exports = { csrfProtection };
