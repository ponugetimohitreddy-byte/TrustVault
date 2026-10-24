const AuditLog = require('../models/AuditLog');

async function logEvent({ actorId, documentId, targetUserId, action, details = {}, req }) {
  const safeDetails = { ...details };
  delete safeDetails.password;
  delete safeDetails.token;
  delete safeDetails.refreshToken;
  delete safeDetails.accessToken;

  await AuditLog.create({
    actorId: actorId || undefined,
    documentId: documentId || undefined,
    targetUserId: targetUserId || undefined,
    action,
    details: safeDetails,
    requestId: req?.requestId,
    ip: req?.ip,
    timestamp: new Date(),
  });
}

module.exports = { logEvent };
