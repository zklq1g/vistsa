const { prisma } = require('../config');
const { sendSuccess, sendError } = require('../utils/response.utils');

class LeaderboardController {
    async getLeaderboard(req, res) {
        try {
            const entries = await prisma.leaderboardEntry.findMany({
                include: { user: { select: { id: true, displayName: true, avatarUrl: true, username: true } } },
                orderBy: { points: 'desc' }
            });

            const userIds = entries.map(e => e.userId);
            const projectCounts = await prisma.projectMember.groupBy({
                by: ['userId'],
                where: { userId: { in: userIds } },
                _count: { projectId: true }
            });

            const countMap = projectCounts.reduce((acc, curr) => {
                acc[curr.userId] = curr._count.projectId;
                return acc;
            }, {});

            const result = entries.map(e => ({
                ...e,
                projectCount: countMap[e.userId] || 0
            }));

            return sendSuccess(res, result, 'Leaderboard fetched successfully');
        } catch (error) {
            return sendError(res, error.message, 500);
        }
    }

    async updatePoints(req, res) {
        try {
            const { userId } = req.params;
            const { delta } = req.body;

            if (typeof delta !== 'number') return sendError(res, 'Delta must be a number', 400);

            const entry = await prisma.leaderboardEntry.upsert({
                where: { userId },
                update: { points: { increment: delta } },
                create: { userId, points: Math.max(0, delta) }
            });

            return sendSuccess(res, entry, 'Points updated successfully');
        } catch (error) {
            return sendError(res, error.message, 500);
        }
    }

    // Reset all leaderboard scores to 0.
    // Route is already protected by requireAdmin middleware — no extra password needed.
    async resetLeaderboard(req, res) {
        try {
            await prisma.leaderboardEntry.updateMany({ data: { points: 0 } });
            return sendSuccess(res, null, 'Leaderboard reset successfully — all points cleared');
        } catch (error) {
            return sendError(res, error.message, 500);
        }
    }
}

module.exports = new LeaderboardController();
