const express = require('express');
const projectController = require('../controllers/project.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { requireAdmin, requireMember } = require('../middleware/role.middleware');

const router = express.Router();

// Public routes
router.get('/', projectController.getProjects);
router.get('/:id', projectController.getProjectById);

// Protected routes (Members & Admins)
router.use(authMiddleware);
router.post('/', requireMember, projectController.submitProject);

// Wait, submitter check logic needs a specific middleware or controller check.
// We'll rely on controller handling / simple member requirement here.
router.patch('/:id', requireMember, projectController.updateProject);

// Admin only routes
router.delete('/:id', requireAdmin, projectController.deleteProject);
router.patch('/:id/approve', requireAdmin, projectController.approveProject);
router.patch('/:id/pin', requireAdmin, projectController.togglePin);

module.exports = router;
