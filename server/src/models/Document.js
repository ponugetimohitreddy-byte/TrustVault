const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 2000, default: '' },
    originalFilename: { type: String, required: true },
    storageKey: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true, min: 0 },
    publisherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    visibility: {
      type: String,
      enum: ['private', 'restricted', 'organization'],
      default: 'private',
    },
    allowDownload: { type: Boolean, default: true },
    status: { type: String, enum: ['active', 'deleted'], default: 'active', index: true },
    version: { type: Number, default: 1, min: 1 },
  },
  { timestamps: true }
);

documentSchema.index({ title: 'text', description: 'text', originalFilename: 'text' });
documentSchema.index({ visibility: 1, status: 1 });

module.exports = mongoose.model('Document', documentSchema);
