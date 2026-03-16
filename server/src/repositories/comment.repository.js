const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CommentRepository = {
    async findByProject(projectId) {
        return prisma.comment.findMany({
            where: { projectId },
            include: {
                user: {
                    select: {
                        id: true,
                        displayName: true,
                        avatarUrl: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    },

    async create(data) {
        return prisma.comment.create({
            data,
            include: {
                user: {
                    select: {
                        id: true,
                        displayName: true,
                        avatarUrl: true
                    }
                }
            }
        });
    },

    async delete(id) {
        return prisma.comment.delete({
            where: { id }
        });
    },

    async findById(id) {
        return prisma.comment.findUnique({
            where: { id }
        });
    }
};

module.exports = CommentRepository;
