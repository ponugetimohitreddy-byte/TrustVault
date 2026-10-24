const express = require('express');
const { authenticate } = require('../middleware/authenticate');
const { validate } = require('../middleware/validate');
const { upload, requireFile } = require('../middleware/upload');
const {
  createDocumentSchema,
  updateDocumentSchema,
  visibilitySchema,
  permissionSchema,
  documentIdSchema,
} = require('../validators/documentValidators');
const documents = require('../controllers/documentController');
const permissions = require('../controllers/permissionController');
const audit = require('../controllers/auditController');

const router = express.Router();
router.use(authenticate);

router.post('/', upload.single('file'), requireFile, validate(createDocumentSchema), documents.createDocument);
router.get('/', documents.listDocuments);
router.get('/:id', validate(documentIdSchema), documents.getDocument);
router.get('/:id/download', validate(documentIdSchema), documents.downloadDocument);
router.get('/:id/preview', validate(documentIdSchema), documents.previewDocument);
router.get('/:id/versions', validate(documentIdSchema), documents.listVersions);
router.patch('/:id', upload.single('file'), validate(updateDocumentSchema), documents.updateDocument);
router.delete('/:id', validate(documentIdSchema), documents.deleteDocument);
router.patch('/:id/visibility', validate(visibilitySchema), documents.changeVisibility);

router.get('/:id/permissions', validate(documentIdSchema), permissions.listPermissions);
router.put('/:id/permissions/:userId', validate(permissionSchema), permissions.upsertPermission);
router.delete('/:id/permissions/:userId', permissions.revokePermission);

router.get('/:id/audit-logs', validate(documentIdSchema), audit.listForDocument);

module.exports = router;
