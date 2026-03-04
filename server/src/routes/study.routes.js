const express = require('express');
const studyController = require('../controllers/study.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { requireMember, requireAdmin, requireMod } = require('../middleware/role.middleware');

const router = express.Router();

router.use(authMiddleware);

// ── Member routes ─────────────────────────────────────────────────────────────
// GET approved resources (visible to all members)
router.get('/', requireMember, studyController.getMaterials);

// POST submit a resource for approval (members)
router.post('/submit', requireMember, studyController.submitMaterial);

// GET own submissions with status (members)
router.get('/my-submissions', requireMember, studyController.getMySubmissions);

// ── Management routes (MOD & ADMIN) ──────────────────────────────────────────────

// GET all materials with any status (admin view)
router.get('/all', requireMod, studyController.getAllMaterials);

// GET only pending submissions
router.get('/pending', requireMod, studyController.getPendingMaterials);

// POST direct admin upload (auto-approved)
router.post('/', requireMod, studyController.uploadMaterial);

// PATCH approve or reject a pending submission
router.patch('/:id/approve', requireMod, studyController.approveMaterial);
router.patch('/:id/reject', requireMod, studyController.rejectMaterial);

// ── Admin-only routes ────────────────────────────────────────────────────────
// DELETE any material (ONLY ADMIN)
router.delete('/:id', requireAdmin, studyController.deleteMaterial);

module.exports = router;
