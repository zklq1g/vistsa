const { prisma } = require('../config');

class UserRepository {
    async findByUsername(username) {
        return prisma.user.findUnique({ where: { username } });
    }

    async findById(id) {
        return prisma.user.findUnique({ where: { id } });
    }

    async create(data) {
        return prisma.user.create({ data });
    }

    async update(id, data) {
        return prisma.user.update({ where: { id }, data });
    }

    async findAll() {
        return prisma.user.findMany({ select: { id: true, username: true, displayName: true, role: true, isActive: true } });
    }
}

module.exports = new UserRepository();
