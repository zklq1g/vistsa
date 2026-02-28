const { prisma } = require('../config');
const { sendSuccess, sendError } = require('../utils/response.utils');

class EventController {
    async getEvents(req, res) {
        try {
            // Public only sees published events
            const isPublic = !req.user || req.user.role === 'VISITOR';
            const where = isPublic ? { isPublished: true } : {};

            const events = await prisma.event.findMany({
                where,
                orderBy: { eventDate: 'asc' },
                include: { createdBy: { select: { id: true, displayName: true } } }
            });
            return sendSuccess(res, events, 'Events fetched successfully');
        } catch (error) {
            return sendError(res, error.message, 500);
        }
    }

    async createEvent(req, res) {
        try {
            const data = req.body;
            const parsedDate = new Date(data.eventDate);

            // Handle invalid date
            if (isNaN(parsedDate.getTime())) {
                return sendError(res, 'Invalid date format provided', 400);
            }

            const event = await prisma.event.create({
                data: { ...data, eventDate: parsedDate, createdById: req.user.userId }
            });
            return sendSuccess(res, event, 'Event created successfully', 201);
        } catch (error) {
            return sendError(res, error.message, 500);
        }
    }

    async updateEvent(req, res) {
        try {
            const { id } = req.params;
            const data = { ...req.body };

            if (data.eventDate) {
                const parsedDate = new Date(data.eventDate);
                if (isNaN(parsedDate.getTime())) {
                    return sendError(res, 'Invalid date format provided', 400);
                }
                data.eventDate = parsedDate;
            }

            const event = await prisma.event.update({ where: { id }, data });
            return sendSuccess(res, event, 'Event updated successfully');
        } catch (error) {
            return sendError(res, error.message, 500);
        }
    }

    async deleteEvent(req, res) {
        try {
            const { id } = req.params;
            await prisma.event.delete({ where: { id } });
            return sendSuccess(res, null, 'Event deleted successfully');
        } catch (error) {
            return sendError(res, error.message, 500);
        }
    }
}

module.exports = new EventController();
