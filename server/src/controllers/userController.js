const User = require('../models/User');
const { asyncHandler } = require('../utils/asyncHandler');
const { AppError } = require('../utils/AppError');
const { hashPassword } = require('../utils/crypto');
const { toSafeUser } = require('../utils/sanitize');
const { parsePagination, paginated } = require('../utils/pagination');
const { logEvent } = require('../services/auditService');
const { revokeAllUserTokens } = require('../services/tokenService');

const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort } = parsePagination(req.query);
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.isActive === 'true') filter.isActive = true;
  if (req.query.isActive === 'false') filter.isActive = false;
  if (req.query.q) {
    const q = String(req.query.q).trim();
    filter.$or = [
      { name: new RegExp(q, 'i') },
      { email: new RegExp(q, 'i') },
      { employeeId: new RegExp(q, 'i') },
    ];
  }
  const [items, total] = await Promise.all([
    User.find(filter).sort(sort).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);
  res.json(paginated(items.map(toSafeUser), total, page, limit));
});

const createUser = asyncHandler(async (req, res) => {
  const body = req.validated.body;
  const existing = await User.findOne({ email: body.email });
  if (existing) throw new AppError(409, 'Email already in use', 'CONFLICT');
  if (body.employeeId) {
    const taken = await User.findOne({ employeeId: body.employeeId });
    if (taken) throw new AppError(409, 'Employee ID already in use', 'CONFLICT');
  }
  const user = await User.create({
    name: body.name,
    email: body.email,
    passwordHash: await hashPassword(body.password),
    role: body.role || 'employee',
    department: body.department,
    employeeId: body.employeeId,
  });
  await logEvent({
    actorId: req.user._id,
    targetUserId: user._id,
    action: 'user.create',
    details: { role: user.role, email: user.email },
    req,
  });
  res.status(201).json({ user: toSafeUser(user) });
});

const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError(404, 'User not found', 'NOT_FOUND');
  res.json({ user: toSafeUser(user) });
});

const updateUser = asyncHandler(async (req, res) => {
  const body = req.validated.body;
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError(404, 'User not found', 'NOT_FOUND');
  if (body.role && body.role !== user.role && req.user.role !== 'admin') {
    throw new AppError(403, 'Only administrators can change roles', 'FORBIDDEN');
  }
  if (body.name) user.name = body.name;
  if (body.department !== undefined) user.department = body.department;
  if (body.employeeId !== undefined) user.employeeId = body.employeeId;
  if (body.role) user.role = body.role;
  await user.save();
  await logEvent({
    actorId: req.user._id,
    targetUserId: user._id,
    action: 'user.update',
    details: { fields: Object.keys(body) },
    req,
  });
  res.json({ user: toSafeUser(user) });
});

const updateStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError(404, 'User not found', 'NOT_FOUND');
  if (String(user._id) === String(req.user._id) && req.validated.body.isActive === false) {
    throw new AppError(400, 'You cannot deactivate your own account', 'VALIDATION');
  }
  user.isActive = req.validated.body.isActive;
  if (!user.isActive) {
    user.tokenVersion += 1;
    await revokeAllUserTokens(user._id);
  }
  await user.save();
  await logEvent({
    actorId: req.user._id,
    targetUserId: user._id,
    action: 'user.status',
    details: { isActive: user.isActive },
    req,
  });
  res.json({ user: toSafeUser(user) });
});

const searchUsers = asyncHandler(async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (!q) return res.json({ items: [] });
  const items = await User.find({
    isActive: true,
    $or: [
      { name: new RegExp(q, 'i') },
      { email: new RegExp(q, 'i') },
      { employeeId: new RegExp(q, 'i') },
    ],
  }).limit(20);
  res.json({ items: items.map(toSafeUser) });
});

module.exports = { listUsers, createUser, getUser, updateUser, updateStatus, searchUsers };
