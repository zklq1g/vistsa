const { prisma } = require('../config');

class ProjectRepository {
    async findAll({ isApproved, search }) {
        const where = {};
        if (isApproved !== undefined) where.isApproved = isApproved;

        if (search) {
            where.OR = [
                { title: { contains: search } },
                { description: { contains: search } }
            ];
        }

        return prisma.project.findMany({
            where,
            include: {
                submittedBy: { select: { id: true, displayName: true, avatarUrl: true } },
                members: { include: { user: { select: { id: true, displayName: true, avatarUrl: true } } } }
            },
            // Pinned first, then sorted by status (could do manual sorting in JS or rely on sortOrder)
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
                submittedBy: { select: { id: true, displayName: true, avatarUrl: true } },
                members: { include: { user: { select: { id: true, displayName: true, avatarUrl: true } } } }
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
