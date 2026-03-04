const express = require('express');
const projectController = require('../controllers/project.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { requireAdmin, requireMod, requireMember } = require('../middleware/role.middleware');

const router = express.Router();

// Public routes
router.get('/', projectController.getProjects);
router.get('/:id', projectController.getProjectById);

// Protected routes (Members, Mods & Admins)
router.use(authMiddleware);
router.post('/', requireMember, projectController.submitProject);
router.patch('/:id', requireMember, projectController.updateProject);

// Management routes
router.patch('/:id/approve', requireMod, projectController.approveProject);
router.patch('/:id/pin', requireMod, projectController.togglePin);

// Admin only routes
router.delete('/:id', requireAdmin, projectController.deleteProject);

module.exports = router;
