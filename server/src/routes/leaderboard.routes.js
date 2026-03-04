const express = require('express');
const leaderboardController = require('../controllers/leaderboard.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/role.middleware');

const router = express.Router();

// Public: anyone can view the leaderboard
router.get('/', leaderboardController.getLeaderboard);

// Admin-only actions
router.use(authMiddleware, requireAdmin);
router.patch('/:userId/points', leaderboardController.updatePoints);
// Changed from DELETE to POST — DELETE with request body is unreliable in some environments
router.post('/reset', leaderboardController.resetLeaderboard);

module.exports = router;
