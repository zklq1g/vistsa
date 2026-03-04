const express = require('express');
const leaderboardController = require('../controllers/leaderboard.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { requireAdmin, requireSystemAdmin } = require('../middleware/role.middleware');

const router = express.Router();

router.get('/', leaderboardController.getLeaderboard);

router.use(authMiddleware);
router.patch('/:userId/points', requireAdmin, leaderboardController.updatePoints);
router.delete('/reset', requireSystemAdmin, leaderboardController.resetLeaderboard);
router.post('/reset', requireSystemAdmin, leaderboardController.resetLeaderboard); // Fallback for environments that block DELETE

module.exports = router;
