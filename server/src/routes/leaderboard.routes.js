const express = require('express');
const leaderboardController = require('../controllers/leaderboard.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { requireAdmin, requireMod } = require('../middleware/role.middleware');

const router = express.Router();

router.get('/', leaderboardController.getLeaderboard);

router.use(authMiddleware);

// Management (MOD & ADMIN)
router.patch('/:userId/points', requireMod, leaderboardController.updatePoints);

// Reset (ADMIN ONLY)
router.delete('/reset', requireAdmin, leaderboardController.resetLeaderboard);
router.post('/reset', requireAdmin, leaderboardController.resetLeaderboard);

module.exports = router;
