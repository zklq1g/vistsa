const { prisma } = require('../config');
const { sendSuccess, sendError } = require('../utils/response.utils');

// Uses a singleton row (id = "singleton")
// GET /api/stats — public, no auth
// PATCH /api/stats — admin only

class StatsController {
    async getStats(req, res) {
        try {
            // Upsert: return existing or create defaults on first access
            const stats = await prisma.siteStats.upsert({
                where: { id: 'singleton' },
                update: {},
                create: {
                    id: 'singleton',
                    projectsCount: 14,
                    bootcampsOrganized: 3,
                    activeMembers: 40,
                    societyMembers: 6,
                }
            });
            return sendSuccess(res, stats, 'Stats fetched successfully');
        } catch (error) {
            return sendError(res, error.message, 500);
        }
    }

    async updateStats(req, res) {
        try {
            const { projectsCount, bootcampsOrganized, activeMembers, societyMembers } = req.body;

            const updated = await prisma.siteStats.upsert({
                where: { id: 'singleton' },
                update: {
                    ...(projectsCount !== undefined && { projectsCount: Number(projectsCount) }),
                    ...(bootcampsOrganized !== undefined && { bootcampsOrganized: Number(bootcampsOrganized) }),
                    ...(activeMembers !== undefined && { activeMembers: Number(activeMembers) }),
                    ...(societyMembers !== undefined && { societyMembers: Number(societyMembers) }),
                },
                create: {
                    id: 'singleton',
                    projectsCount: projectsCount ?? 14,
                    bootcampsOrganized: bootcampsOrganized ?? 3,
                    activeMembers: activeMembers ?? 40,
                    societyMembers: societyMembers ?? 6,
                }
            });
            return sendSuccess(res, updated, 'Stats updated successfully');
        } catch (error) {
            return sendError(res, error.message, 500);
        }
    }
}

module.exports = new StatsController();
