const express = require('express');
const router = express.Router();
const CommentController = require('../controllers/comment.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/project/:projectId', CommentController.getProjectComments);

router.use(authMiddleware);

router.post('/project/:projectId', CommentController.addComment);
router.delete('/:id', CommentController.deleteComment);
router.post('/:id/like', CommentController.toggleLike);
router.post('/:id/report', CommentController.reportComment);
router.get('/users/search', CommentController.searchUsers);

module.exports = router;
