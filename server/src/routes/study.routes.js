const express = require('express');
const studyController = require('../controllers/study.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { requireMember, requireAdmin } = require('../middleware/role.middleware');

const router = express.Router();

router.use(authMiddleware);

// ── Member routes ─────────────────────────────────────────────────────────────
// GET approved resources (visible to all members)
router.get('/', requireMember, studyController.getMaterials);

// POST submit a resource for approval (members)
router.post('/submit', requireMember, studyController.submitMaterial);

// GET own submissions with status (members)
router.get('/my-submissions', requireMember, studyController.getMySubmissions);

// ── Admin routes ──────────────────────────────────────────────────────────────
router.use(requireAdmin);

// GET all materials with any status (admin view)
router.get('/all', studyController.getAllMaterials);

// GET only pending submissions
router.get('/pending', studyController.getPendingMaterials);

// POST direct admin upload (auto-approved)
router.post('/', studyController.uploadMaterial);

// PATCH approve or reject a pending submission
router.patch('/:id/approve', studyController.approveMaterial);
router.patch('/:id/reject', studyController.rejectMaterial);

// DELETE any material (admin can delete any)
router.delete('/:id', studyController.deleteMaterial);

module.exports = router;
