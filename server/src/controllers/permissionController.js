const User = require('../models/User');
const DocumentPermission = require('../models/DocumentPermission');
const { asyncHandler } = require('../utils/asyncHandler');
const { AppError } = require('../utils/AppError');
const { logEvent } = require('../services/auditService');
const access = require('../services/accessService');

const listPermissions = asyncHandler(async (req, res) => {
  const doc = await access.loadActiveDocument(req.params.id);
  await access.requireView(req.user, doc);
  const perms = await DocumentPermission.find({ documentId: doc._id }).populate('userId', 'name email employeeId isActive').populate('grantedBy', 'name email');
  res.json({
    publisher: doc.publisherId
      ? {
          id: String(doc.publisherId._id || doc.publisherId),
          name: doc.publisherId.name,
          email: doc.publisherId.email,
          permission: 'publisher',
        }
      : null,
    items: perms.map((p) => ({
      id: String(p._id),
      user: p.userId
        ? {
            id: String(p.userId._id),
            name: p.userId.name,
            email: p.userId.email,
            employeeId: p.userId.employeeId,
            isActive: p.userId.isActive,
          }
        : null,
      permission: p.permission,
      grantedBy: p.grantedBy ? { id: String(p.grantedBy._id), name: p.grantedBy.name } : null,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    })),
  });
});

const upsertPermission = asyncHandler(async (req, res) => {
  const doc = await access.loadActiveDocument(req.params.id);
  await access.requireManagePermissions(req.user, doc);
  const target = await User.findById(req.params.userId);
  if (!target || !target.isActive) throw new AppError(400, 'Target user must exist and be active', 'VALIDATION');
  if (String(target._id) === String(doc.publisherId._id || doc.publisherId)) {
    throw new AppError(400, 'Publisher already has full access and is not stored as a permission', 'VALIDATION');
  }
  const existing = await DocumentPermission.findOne({ documentId: doc._id, userId: target._id });
  const nextLevel = req.validated.body.permission;
  if (existing) {
    existing.permission = nextLevel;
    existing.grantedBy = req.user._id;
    await existing.save();
    await logEvent({
      actorId: req.user._id,
      documentId: doc._id,
      targetUserId: target._id,
      action: 'permission.update',
      details: { permission: nextLevel },
      req,
    });
    return res.json({ permission: { userId: String(target._id), permission: existing.permission } });
  }
  const created = await DocumentPermission.create({
    documentId: doc._id,
    userId: target._id,
    permission: nextLevel,
    grantedBy: req.user._id,
  });
  await logEvent({
    actorId: req.user._id,
    documentId: doc._id,
    targetUserId: target._id,
    action: 'permission.grant',
    details: { permission: nextLevel },
    req,
  });
  res.status(201).json({ permission: { userId: String(target._id), permission: created.permission } });
});

const revokePermission = asyncHandler(async (req, res) => {
  const doc = await access.loadActiveDocument(req.params.id);
  await access.requireManagePermissions(req.user, doc);
  const deleted = await DocumentPermission.findOneAndDelete({
    documentId: doc._id,
    userId: req.params.userId,
  });
  if (!deleted) throw new AppError(404, 'Permission not found', 'NOT_FOUND');
  await logEvent({
    actorId: req.user._id,
    documentId: doc._id,
    targetUserId: req.params.userId,
    action: 'permission.revoke',
    details: { previous: deleted.permission },
    req,
  });
  res.json({ ok: true });
});

module.exports = { listPermissions, upsertPermission, revokePermission };
