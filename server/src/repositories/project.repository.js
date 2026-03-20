const { prisma } = require('../config');

class ProjectRepository {
  async findAll({ isApproved, search }) {
    const where = {};
    if (isApproved !== undefined) where.isApproved = isApproved;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    return prisma.project.findMany({
      where,
      include: {
        submittedBy: { select: { id: true, displayName: true, username: true, avatarUrl: true } },
        members: { include: { user: { select: { id: true, displayName: true, username: true, avatarUrl: true } } } }
      },
      orderBy: [
        { isPinned: 'desc' },
        { sortOrder: 'desc' },
        { createdAt: 'desc' }
      ]
    });
  }

  async findById(id) {
    return prisma.project.findUnique({
      where: { id },
      include: {
        submittedBy: { select: { id: true, displayName: true, username: true, avatarUrl: true } },
        members: { include: { user: { select: { id: true, displayName: true, username: true, avatarUrl: true } } } }
      }
    });
  }

  async create(data) {
    return prisma.project.create({ data });
  }

  async update(id, data) {
    return prisma.project.update({ where: { id }, data });
  }

  async delete(id) {
    return prisma.project.delete({ where: { id } });
  }
}

module.exports = new ProjectRepository();
