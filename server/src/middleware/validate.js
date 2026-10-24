const { AppError } = require('../utils/AppError');

function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });
    if (!result.success) {
      const message = result.error.issues.map((i) => i.message).join('; ');
      return next(new AppError(400, message, 'VALIDATION'));
    }
    req.validated = result.data;
    next();
  };
}

module.exports = { validate };
