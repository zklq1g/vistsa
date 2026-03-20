const { prisma } = require('../config');

const userSelect = {
  id: true,
  displayName: true,
  username: true,
  avatarUrl: true
};

const CommentRepository = {
  async findByProject(projectId) {
    return prisma.comment.findMany({
      where: { projectId },
      include: {
        user: { select: userSelect },
        likes: { select: { userId: true } },
        _count: { select: { likes: true, reports: true } },
        children: {
          include: {
            user: { select: userSelect },
            likes: { select: { userId: true } },
            _count: { select: { likes: true, reports: true } },
            children: {
              include: {
                user: { select: userSelect },
                likes: { select: { userId: true } },
                _count: { select: { likes: true, reports: true } },
                children: {
                  include: {
                    user: { select: userSelect },
                    likes: { select: { userId: true } },
                    _count: { select: { likes: true, reports: true } },
                  },
                  orderBy: { createdAt: 'asc' }
                }
              },
              orderBy: { createdAt: 'asc' }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  async findTopLevel(projectId) {
    const all = await this.findByProject(projectId);
    return all.filter(c => !c.parentId);
  },

  async create(data) {
    return prisma.comment.create({
      data,
      include: {
        user: { select: userSelect },
        likes: { select: { userId: true } },
        _count: { select: { likes: true, reports: true } },
      }
    });
  },

  async delete(id) {
    return prisma.comment.delete({ where: { id } });
  },

  async findById(id) {
    return prisma.comment.findUnique({
      where: { id },
      include: {
        user: { select: userSelect },
      }
    });
  },

  async toggleLike(commentId, userId) {
    const existing = await prisma.commentLike.findUnique({
      where: { commentId_userId: { commentId, userId } }
    });
    if (existing) {
      await prisma.commentLike.delete({ where: { id: existing.id } });
      return { liked: false };
    } else {
      await prisma.commentLike.create({ data: { commentId, userId } });
      return { liked: true };
    }
  },

  async report(commentId, userId, reason) {
    const existing = await prisma.commentReport.findUnique({
      where: { commentId_userId: { commentId, userId } }
    });
    if (existing) {
      return { alreadyReported: true };
    }
    await prisma.commentReport.create({ data: { commentId, userId, reason } });
    return { alreadyReported: false };
  }
};

module.exports = CommentRepository;
