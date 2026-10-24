const AuditLog = require('../models/AuditLog');
const { asyncHandler } = require('../utils/asyncHandler');
const { parsePagination, paginated } = require('../utils/pagination');
const access = require('../services/accessService');

function serialize(log) {
  return {
    id: String(log._id),
    action: log.action,
    timestamp: log.timestamp,
    details: log.details,
    requestId: log.requestId,
    actor: log.actorId
      ? { id: String(log.actorId._id || log.actorId), name: log.actorId.name, email: log.actorId.email }
      : null,
    document: log.documentId
      ? { id: String(log.documentId._id || log.documentId), title: log.documentId.title }
      : null,
    targetUser: log.targetUserId
      ? { id: String(log.targetUserId._id || log.targetUserId), name: log.targetUserId.name, email: log.targetUserId.email }
      : null,
  };
}

const listAll = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = {};
  if (req.query.action) filter.action = req.query.action;
  if (req.query.actorId) filter.actorId = req.query.actorId;
  if (req.query.documentId) filter.documentId = req.query.documentId;
  const [items, total] = await Promise.all([
    AuditLog.find(filter)
      .populate('actorId', 'name email')
      .populate('documentId', 'title')
      .populate('targetUserId', 'name email')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit),
    AuditLog.countDocuments(filter),
  ]);
  res.json(paginated(items.map(serialize), total, page, limit));
});

const listForDocument = asyncHandler(async (req, res) => {
  const doc = await access.loadActiveDocument(req.params.id);
  const isAdmin = req.user.role === 'admin';
  const isPublisher = access.isPublisher(req.user, doc);
  if (!isAdmin && !isPublisher) {
    await access.requireView(req.user, doc);
  }
  const { page, limit, skip } = parsePagination(req.query);
  const filter = { documentId: doc._id };
  if (!isAdmin && !isPublisher) {
    filter.actorId = req.user._id;
  }
  const [items, total] = await Promise.all([
    AuditLog.find(filter)
      .populate('actorId', 'name email')
      .populate('documentId', 'title')
      .populate('targetUserId', 'name email')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit),
    AuditLog.countDocuments(filter),
  ]);
  res.json(paginated(items.map(serialize), total, page, limit));
});

module.exports = { listAll, listForDocument };
