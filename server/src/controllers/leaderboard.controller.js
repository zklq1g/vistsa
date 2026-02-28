const { prisma } = require('../config');
const { sendSuccess, sendError } = require('../utils/response.utils');

class LeaderboardController {
    async getLeaderboard(req, res) {
        try {
            const entries = await prisma.leaderboardEntry.findMany({
                include: { user: { select: { id: true, displayName: true, avatarUrl: true } } },
                orderBy: { points: 'desc' }
            });

            // Compute project count for each user via a join-like count
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
            const { delta } = req.body; // e.g. +10 or -5

            if (typeof delta !== 'number') return sendError(res, 'Delta must be a number', 400);

            const entry = await prisma.leaderboardEntry.upsert({
                where: { userId },
                update: { points: { increment: delta } },
                create: { userId, points: delta }
            });

            return sendSuccess(res, entry, 'Points updated successfully');
        } catch (error) {
            return sendError(res, error.message, 500);
        }
    }

    async resetLeaderboard(req, res) {
        try {
            const { confirmPassword } = req.body;

            // Spec requires admin password confirmation for this destructive action
            if (confirmPassword !== process.env.ADMIN_RESET_PASSWORD) {
                return sendError(res, 'Invalid confirmation password', 403);
            }

            await prisma.leaderboardEntry.updateMany({ data: { points: 0 } });
            return sendSuccess(res, null, 'Leaderboard reset successfully');
        } catch (error) {
            return sendError(res, error.message, 500);
        }
    }
}

module.exports = new LeaderboardController();
