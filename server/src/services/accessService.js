const mongoose = require('mongoose');
const Document = require('../models/Document');
const DocumentPermission = require('../models/DocumentPermission');
const { AppError } = require('../utils/AppError');

function isAdmin(user) {
  return user?.role === 'admin';
}

function isPublisher(user, doc) {
  return String(doc.publisherId?._id || doc.publisherId) === String(user.id || user._id);
}

async function getExplicitPermission(documentId, userId) {
  return DocumentPermission.findOne({ documentId, userId });
}

async function canView(user, doc) {
  if (doc.status !== 'active') return false;
  if (isAdmin(user) || isPublisher(user, doc)) return true;
  if (doc.visibility === 'organization') return true;
  if (doc.visibility === 'private') return false;
  const perm = await getExplicitPermission(doc._id, user.id || user._id);
  return Boolean(perm);
}

async function canEdit(user, doc) {
  if (doc.status !== 'active') return false;
  if (isAdmin(user) || isPublisher(user, doc)) return true;
  const perm = await getExplicitPermission(doc._id, user.id || user._id);
  return perm?.permission === 'editor';
}

async function canDownload(user, doc) {
  const view = await canView(user, doc);
  if (!view) return false;
  if (isAdmin(user) || isPublisher(user, doc)) return true;
  return Boolean(doc.allowDownload);
}

async function canManagePermissions(user, doc) {
  if (doc.status !== 'active') return false;
  return isAdmin(user) || isPublisher(user, doc);
}

async function canChangeVisibility(user, doc, nextVisibility) {
  if (doc.status !== 'active') return false;
  if (isAdmin(user)) return true;
  if (!isPublisher(user, doc)) return false;
  return nextVisibility !== 'organization';
}

async function canDelete(user, doc) {
  if (doc.status !== 'active') return false;
  return isAdmin(user) || isPublisher(user, doc);
}

async function getEffectiveAccess(user, doc) {
  if (doc.status !== 'active') {
    return { role: 'none', canView: false, canEdit: false, canDownload: false, canManagePermissions: false, canDelete: false, canChangeVisibility: false };
  }
  if (isAdmin(user)) {
    return { role: 'admin', canView: true, canEdit: true, canDownload: true, canManagePermissions: true, canDelete: true, canChangeVisibility: true };
  }
  if (isPublisher(user, doc)) {
    return { role: 'publisher', canView: true, canEdit: true, canDownload: true, canManagePermissions: true, canDelete: true, canChangeVisibility: true };
  }
  const perm = await getExplicitPermission(doc._id, user.id || user._id);
  if (perm?.permission === 'editor') {
    return {
      role: 'editor',
      canView: true,
      canEdit: true,
      canDownload: Boolean(doc.allowDownload),
      canManagePermissions: false,
      canDelete: false,
      canChangeVisibility: false,
    };
  }
  if (perm?.permission === 'viewer' || doc.visibility === 'organization') {
    return {
      role: perm?.permission === 'viewer' ? 'viewer' : 'org-viewer',
      canView: true,
      canEdit: false,
      canDownload: Boolean(doc.allowDownload),
      canManagePermissions: false,
      canDelete: false,
      canChangeVisibility: false,
    };
  }
  return { role: 'none', canView: false, canEdit: false, canDownload: false, canManagePermissions: false, canDelete: false, canChangeVisibility: false };
}

function notFoundOrForbidden() {
  throw new AppError(404, 'Document not found', 'NOT_FOUND');
}

async function loadActiveDocument(id) {
  if (!mongoose.isValidObjectId(id)) notFoundOrForbidden();
  const doc = await Document.findById(id).populate('publisherId', 'name email role isActive');
  if (!doc || doc.status !== 'active') notFoundOrForbidden();
  return doc;
}

async function requireView(user, doc) {
  if (!(await canView(user, doc))) notFoundOrForbidden();
}

async function requireEdit(user, doc) {
  if (!(await canView(user, doc))) notFoundOrForbidden();
  if (!(await canEdit(user, doc))) {
    throw new AppError(403, 'You do not have permission to edit this document', 'FORBIDDEN');
  }
}

async function requireManagePermissions(user, doc) {
  if (!(await canView(user, doc))) notFoundOrForbidden();
  if (!(await canManagePermissions(user, doc))) {
    throw new AppError(403, 'You do not have permission to manage access', 'FORBIDDEN');
  }
}

async function visibleDocumentFilter(user) {
  const uid = user.id || user._id;
  if (isAdmin(user)) {
    return { status: 'active' };
  }
  const perms = await DocumentPermission.find({ userId: uid }).select('documentId');
  const sharedIds = perms.map((p) => p.documentId);
  return {
    status: 'active',
    $or: [
      { publisherId: uid },
      { visibility: 'organization' },
      { _id: { $in: sharedIds } },
    ],
  };
}

module.exports = {
  isAdmin,
  isPublisher,
  canView,
  canEdit,
  canDownload,
  canManagePermissions,
  canChangeVisibility,
  canDelete,
  getEffectiveAccess,
  loadActiveDocument,
  requireView,
  requireEdit,
  requireManagePermissions,
  visibleDocumentFilter,
  notFoundOrForbidden,
};
