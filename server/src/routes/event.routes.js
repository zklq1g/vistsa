const express = require('express');
const eventController = require('../controllers/event.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { requireAdmin, requireMod } = require('../middleware/role.middleware');
const { verifyToken } = require('../utils/jwt.utils');

const router = express.Router();

const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      req.user = decoded;
    }
  } catch (e) {
    // Token invalid or expired — continue as public
  }
  next();
};

router.get('/', optionalAuth, eventController.getEvents);

router.use(authMiddleware);

router.post('/', requireMod, eventController.createEvent);
router.patch('/:id', requireMod, eventController.updateEvent);
router.delete('/:id', requireAdmin, eventController.deleteEvent);

module.exports = router;
