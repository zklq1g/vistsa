const express = require('express');
const statsController = require('../controllers/stats.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/role.middleware');

const router = express.Router();

// GET /api/stats — public
router.get('/', statsController.getStats);

// PATCH /api/stats — admin only
router.patch('/', authMiddleware, requireAdmin, statsController.updateStats);

module.exports = router;
