const CommentRepository = require('../repositories/comment.repository');

const CommentController = {
    async getProjectComments(req, res) {
        try {
            const comments = await CommentRepository.findByProject(req.params.projectId);
            res.json({ success: true, data: comments });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    async addComment(req, res) {
        try {
            const { content } = req.body;
            const { projectId } = req.params;
            const userId = req.user.userId;

            console.log(`[VISTA] Adding comment: user=${userId}, project=${projectId}`);

            if (!content) return res.status(400).json({ success: false, message: 'Content is required' });

            const newComment = await CommentRepository.create({
                content,
                projectId,
                userId
            });
            console.log(`[VISTA] Comment created: ${newComment.id}`);
            res.status(201).json({ success: true, data: newComment });
        } catch (err) {
            console.error('[VISTA] Add comment error:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    },

    async deleteComment(req, res) {
        try {
            const comment = await CommentRepository.findById(req.params.id);
            if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

            // Only author or admin can delete
            if (comment.userId !== req.user.userId && req.user.role !== 'ADMIN') {
                return res.status(403).json({ success: false, message: 'Unauthorized' });
            }

            await CommentRepository.delete(req.params.id);
            res.json({ success: true, message: 'Comment deleted' });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
};

module.exports = CommentController;
