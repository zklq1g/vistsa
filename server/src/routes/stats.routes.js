const { requireAdmin, requireSystemAdmin } = require('../middleware/role.middleware');

const router = express.Router();

// GET /api/stats — public
router.get('/', statsController.getStats);

// PATCH /api/stats — system admin only
router.patch('/', authMiddleware, requireSystemAdmin, statsController.updateStats);

module.exports = router;
