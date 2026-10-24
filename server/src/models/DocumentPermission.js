const mongoose = require('mongoose');

const documentPermissionSchema = new mongoose.Schema(
  {
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    permission: { type: String, enum: ['editor', 'viewer'], required: true },
    grantedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

documentPermissionSchema.index({ documentId: 1, userId: 1 }, { unique: true });
documentPermissionSchema.index({ userId: 1 });

module.exports = mongoose.model('DocumentPermission', documentPermissionSchema);
