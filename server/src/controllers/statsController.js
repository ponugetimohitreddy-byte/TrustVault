const User = require('../models/User');
const Document = require('../models/Document');
const AuditLog = require('../models/AuditLog');
const { asyncHandler } = require('../utils/asyncHandler');

const dashboard = asyncHandler(async (req, res) => {
  const [totalUsers, activeUsers, totalDocuments, recent] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    Document.countDocuments({ status: 'active' }),
    AuditLog.find({ documentId: { $ne: null } })
      .populate('actorId', 'name email')
      .populate('documentId', 'title')
      .sort({ timestamp: -1 })
      .limit(10),
  ]);
  res.json({
    totalUsers,
    activeUsers,
    totalDocuments,
    recentActivity: recent.map((log) => ({
      id: String(log._id),
      action: log.action,
      timestamp: log.timestamp,
      actor: log.actorId ? { name: log.actorId.name, email: log.actorId.email } : null,
      document: log.documentId ? { id: String(log.documentId._id), title: log.documentId.title } : null,
    })),
  });
});

module.exports = { dashboard };
