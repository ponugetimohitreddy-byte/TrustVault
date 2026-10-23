const { AppError } = require('../utils/AppError');

function notFound(req, res, next) {
  next(new AppError(404, 'Route not found', 'NOT_FOUND'));
}

function errorHandler(err, req, res, _next) {
  if (err && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: { code: 'VALIDATION', message: 'File exceeds size limit' } });
  }
  if (err && err.name === 'MulterError') {
    return res.status(400).json({ error: { code: 'VALIDATION', message: err.message } });
  }

  const status = err.statusCode || 500;
  const code = err.code || 'ERROR';
  const message = status === 500 ? 'Internal server error' : err.message;

  if (status === 500 && process.env.NODE_ENV !== 'test') {
    console.error('[error]', req.requestId, err.message);
  }

  res.status(status).json({
    error: {
      code,
      message,
      requestId: req.requestId,
    },
  });
}

module.exports = { notFound, errorHandler };
