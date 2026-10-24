const express = require('express');
const { authenticate, requireAdmin } = require('../middleware/authenticate');
const { dashboard } = require('../controllers/statsController');

const router = express.Router();
router.get('/dashboard', authenticate, requireAdmin, dashboard);

module.exports = router;
