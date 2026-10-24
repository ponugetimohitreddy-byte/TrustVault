const express = require('express');
const { authenticate, requireAdmin } = require('../middleware/authenticate');
const { validate } = require('../middleware/validate');
const {
  createUserSchema,
  updateUserSchema,
  statusSchema,
  idParamSchema,
} = require('../validators/userValidators');
const {
  listUsers,
  createUser,
  getUser,
  updateUser,
  updateStatus,
  searchUsers,
} = require('../controllers/userController');

const router = express.Router();

router.use(authenticate);

router.get('/search', searchUsers);
router.get('/', requireAdmin, listUsers);
router.post('/', requireAdmin, validate(createUserSchema), createUser);
router.get('/:id', requireAdmin, validate(idParamSchema), getUser);
router.patch('/:id', requireAdmin, validate(updateUserSchema), updateUser);
router.patch('/:id/status', requireAdmin, validate(statusSchema), updateStatus);

module.exports = router;
