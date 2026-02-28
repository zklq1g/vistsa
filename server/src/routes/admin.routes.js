const express = require('express');
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/role.middleware');

const router = express.Router();

// All admin routes are protected by JWT and require ADMIN role
router.use(authMiddleware, requireAdmin);

// User Management
router.post('/users', adminController.createUser);
router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/reset-password', adminController.resetUserPassword);
router.delete('/users/:id', adminController.deleteUser);

module.exports = router;
