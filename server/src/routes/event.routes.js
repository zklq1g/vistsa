const express = require('express');
const eventController = require('../controllers/event.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/role.middleware');

const router = express.Router();

// Optional auth for public GET (so we know if they are admin to show unpublished)
router.get('/', (req, res, next) => {
    // Try to authenticate but don't fail if no token
    if (req.headers.authorization) {
        return authMiddleware(req, res, (err) => {
            if (err) return next();
            next();
        });
    }
    next();
}, eventController.getEvents);

router.use(authMiddleware, requireAdmin);
router.post('/', eventController.createEvent);
router.patch('/:id', eventController.updateEvent);
router.delete('/:id', eventController.deleteEvent);

module.exports = router;
