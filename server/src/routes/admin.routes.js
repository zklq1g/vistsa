const express = require('express');
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { requireAdmin, requireMod } = require('../middleware/role.middleware');

const router = express.Router();

// Middleware
router.use(authMiddleware);

// User Management (MOD & ADMIN)
router.post('/users', requireMod, adminController.createUser);
router.get('/users', requireMod, adminController.getAllUsers);
router.patch('/users/:id/reset-password', requireMod, adminController.resetUserPassword);
router.patch('/users/:id/toggle-status', requireMod, adminController.toggleUserStatus);

// Critical Actions (ADMIN ONLY)
router.delete('/users/:id/permanent', requireAdmin, adminController.permanentlyDeleteUser);

module.exports = router;
