const CommentRepository = require('../repositories/comment.repository');
const { sendSuccess, sendError } = require('../utils/response.utils');
const { prisma } = require('../config');

const MAX_COMMENT_LENGTH = 2000;

const CommentController = {
  async getProjectComments(req, res) {
    try {
      const comments = await CommentRepository.findTopLevel(req.params.projectId);
      return sendSuccess(res, comments, 'Comments fetched successfully');
    } catch (err) {
      return sendError(res, 'Failed to fetch comments', 500);
    }
  },

  async addComment(req, res) {
    try {
      const { content, parentId } = req.body;
      if (!content || !content.trim()) {
        return sendError(res, 'Comment content is required', 400);
      }

      const trimmed = content.trim();

      if (trimmed.length > MAX_COMMENT_LENGTH) {
        return sendError(res, `Comment must be under ${MAX_COMMENT_LENGTH} characters`, 400);
      }

      if (parentId) {
        const parent = await CommentRepository.findById(parentId);
        if (!parent) {
          return sendError(res, 'Parent comment not found', 404);
        }
        if (parent.projectId !== req.params.projectId) {
          return sendError(res, 'Parent comment does not belong to this project', 400);
        }
      }

      const newComment = await CommentRepository.create({
        content: trimmed,
        projectId: req.params.projectId,
        userId: req.user.userId,
        parentId: parentId || null
      });
      return sendSuccess(res, newComment, 'Comment posted successfully', 201);
    } catch (err) {
      return sendError(res, 'Failed to post comment', 500);
    }
  },

  async deleteComment(req, res) {
    try {
      const comment = await CommentRepository.findById(req.params.id);
      if (!comment) {
        return sendError(res, 'Comment not found', 404);
      }

      const isOwner = comment.userId === req.user.userId;
      const isMod = req.user.role === 'MOD' || req.user.role === 'ADMIN';

      if (!isOwner && !isMod) {
        return sendError(res, 'You do not have permission to delete this comment', 403);
      }

      await CommentRepository.delete(req.params.id);
      return sendSuccess(res, null, 'Comment deleted successfully');
    } catch (err) {
      return sendError(res, 'Failed to delete comment', 500);
    }
  },

  async toggleLike(req, res) {
    try {
      const result = await CommentRepository.toggleLike(req.params.id, req.user.userId);
      return sendSuccess(res, result, result.liked ? 'Comment liked' : 'Like removed');
    } catch (err) {
      return sendError(res, 'Failed to toggle like', 500);
    }
  },

  async reportComment(req, res) {
    try {
      const { reason } = req.body;
      const result = await CommentRepository.report(req.params.id, req.user.userId, reason || null);
      if (result.alreadyReported) {
        return sendError(res, 'You have already reported this comment', 400);
      }
      return sendSuccess(res, null, 'Comment reported successfully');
    } catch (err) {
      return sendError(res, 'Failed to report comment', 500);
    }
  },

  async searchUsers(req, res) {
    try {
      const { q } = req.query;
      if (!q || q.length < 1) {
        return sendSuccess(res, [], 'No query');
      }
      const users = await prisma.user.findMany({
        where: {
          isActive: true,
          OR: [
            { username: { contains: q, mode: 'insensitive' } },
            { displayName: { contains: q, mode: 'insensitive' } }
          ]
        },
        select: { id: true, username: true, displayName: true, avatarUrl: true },
        take: 8
      });
      return sendSuccess(res, users, 'Users found');
    } catch (err) {
      return sendError(res, 'Failed to search users', 500);
    }
  }
};

module.exports = CommentController;
