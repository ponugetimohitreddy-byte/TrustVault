process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-please-change-32ch';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-please-change-32';
process.env.JWT_ISSUER = 'mohit-doc-viewer';
process.env.JWT_AUDIENCE = 'mohit-doc-viewer-client';
process.env.JWT_ACCESS_EXPIRES = '15m';
process.env.CLIENT_ORIGIN = 'http://localhost:5173';
process.env.STORAGE_DRIVER = 'local';
