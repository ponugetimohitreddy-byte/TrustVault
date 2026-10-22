const mongoose = require('mongoose');

const ACTIONS = [
  'auth.login.success',
  'auth.login.failure',
  'auth.logout',
  'user.create',
  'user.update',
  'user.status',
  'document.upload',
  'document.view',
  'document.download',
  'document.update',
  'document.replace',
  'document.delete',
  'document.visibility',
  'document.reassign',
  'permission.grant',
  'permission.update',
  'permission.revoke',
];

const auditLogSchema = new mongoose.Schema(
  {
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
    targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true, enum: ACTIONS },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
    requestId: { type: String },
    ip: { type: String },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false }
);

auditLogSchema.index({ actorId: 1, timestamp: -1 });
auditLogSchema.index({ documentId: 1, timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
module.exports.ACTIONS = ACTIONS;
