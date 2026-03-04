const express = require('express');
const studyController = require('../controllers/study.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { requireMember, requireAdmin } = require('../middleware/role.middleware');

const router = express.Router();

router.use(authMiddleware);

// Members: view approved resources
router.get('/', requireMember, studyController.getMaterials);

// Members: submit a resource for approval
router.post('/submit', requireMember, studyController.submitMaterial);

// Admin-only routes
router.use(requireAdmin);
router.post('/', studyController.uploadMaterial);           // admin direct publish
router.patch('/:id/approve', studyController.approveMaterial);
router.patch('/:id/reject', studyController.rejectMaterial);
router.delete('/:id', studyController.deleteMaterial);

module.exports = router;
