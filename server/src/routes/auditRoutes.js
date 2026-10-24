const express = require('express');
const { authenticate, requireAdmin } = require('../middleware/authenticate');
const { listAll } = require('../controllers/auditController');

const router = express.Router();
router.use(authenticate, requireAdmin);
router.get('/', listAll);

module.exports = router;
