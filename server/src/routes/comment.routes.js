const express = require('express');
const router = express.Router();
const CommentController = require('../controllers/comment.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Public: Get comments for a project
router.get('/project/:projectId', CommentController.getProjectComments);

// Protected: Post a comment
router.post('/project/:projectId', authenticate, CommentController.addComment);

// Protected: Delete a comment (Author or Admin)
router.delete('/:id', authenticate, CommentController.deleteComment);

module.exports = router;
