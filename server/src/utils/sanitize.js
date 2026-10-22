function sanitizeFilename(name = '') {
  return String(name)
    .replace(/[/\\?%*:|"<>]/g, '_')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 255);
}

function toSafeUser(user) {
  if (!user) return null;
  const obj = user.toObject ? user.toObject() : user;
  return {
    id: String(obj._id),
    name: obj.name,
    email: obj.email,
    role: obj.role,
    department: obj.department || '',
    employeeId: obj.employeeId || '',
    isActive: obj.isActive,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
}

function toSafeDocument(doc, extras = {}) {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    id: String(obj._id),
    title: obj.title,
    description: obj.description || '',
    originalFilename: obj.originalFilename,
    mimeType: obj.mimeType,
    size: obj.size,
    publisherId: String(obj.publisherId?._id || obj.publisherId),
    publisher: obj.publisherId && obj.publisherId.name
      ? { id: String(obj.publisherId._id), name: obj.publisherId.name, email: obj.publisherId.email }
      : undefined,
    visibility: obj.visibility,
    allowDownload: obj.allowDownload,
    status: obj.status,
    version: obj.version,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
    ...extras,
  };
}

module.exports = { sanitizeFilename, toSafeUser, toSafeDocument };
