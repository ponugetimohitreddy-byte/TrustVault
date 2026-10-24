const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['admin', 'employee'], required: true, default: 'employee' },
    department: { type: String, trim: true, maxlength: 120 },
    employeeId: { type: String, trim: true, unique: true, sparse: true },
    isActive: { type: Boolean, default: true },
    tokenVersion: { type: Number, default: 0 },
  },
  { timestamps: true }
);

userSchema.index({ name: 'text', email: 'text', employeeId: 'text' });

module.exports = mongoose.model('User', userSchema);
