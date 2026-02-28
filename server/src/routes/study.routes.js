const express = require('express');
const studyController = require('../controllers/study.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { requireMember, requireAdmin } = require('../middleware/role.middleware');

const router = express.Router();

router.use(authMiddleware);
router.get('/', requireMember, studyController.getMaterials);

router.use(requireAdmin);
router.post('/', studyController.uploadMaterial);
router.delete('/:id', studyController.deleteMaterial);

module.exports = router;
