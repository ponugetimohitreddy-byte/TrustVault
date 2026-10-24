const multer = require('multer');
const path = require('path');
const { env } = require('../config/env');
const { AppError } = require('../utils/AppError');

const ALLOWED_EXT = new Set(['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.png', '.jpg', '.jpeg', '.txt', '.csv']);
const ALLOWED_MIME = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png',
  'image/jpeg',
  'text/plain',
  'text/csv',
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.storage.maxFileSizeMb * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    if (!ALLOWED_EXT.has(ext) || !ALLOWED_MIME.has(file.mimetype)) {
      return cb(new AppError(400, 'Unsupported file type', 'VALIDATION'));
    }
    cb(null, true);
  },
});

function requireFile(req, res, next) {
  if (!req.file) return next(new AppError(400, 'A file is required', 'VALIDATION'));
  next();
}

module.exports = { upload, requireFile, ALLOWED_EXT, ALLOWED_MIME };
