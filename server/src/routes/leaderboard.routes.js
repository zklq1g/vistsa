const express = require('express');
const leaderboardController = require('../controllers/leaderboard.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/role.middleware');

const router = express.Router();

router.get('/', leaderboardController.getLeaderboard);

router.use(authMiddleware, requireAdmin);
router.patch('/:userId/points', leaderboardController.updatePoints);
router.delete('/reset', leaderboardController.resetLeaderboard);

module.exports = router;
