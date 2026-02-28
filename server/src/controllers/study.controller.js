const { prisma } = require('../config');
const { sendSuccess, sendError } = require('../utils/response.utils');

class StudyController {
    async getMaterials(req, res) {
        try {
            const { category } = req.query;
            const where = category ? { category } : {};

            const materials = await prisma.studyMaterial.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                include: { uploadedBy: { select: { id: true, displayName: true } } }
            });
            return sendSuccess(res, materials, 'Study materials fetched successfully');
        } catch (error) {
            return sendError(res, error.message, 500);
        }
    }

    async uploadMaterial(req, res) {
        try {
            const { title, description, fileUrl, externalUrl, category } = req.body;

            if (!title || !category) {
                return sendError(res, 'Title and category are required', 400);
            }

            const material = await prisma.studyMaterial.create({
                data: {
                    title, description, fileUrl, externalUrl, category,
                    uploadedById: req.user.userId
                }
            });
            return sendSuccess(res, material, 'Material uploaded successfully', 201);
        } catch (error) {
            return sendError(res, error.message, 500);
        }
    }

    async deleteMaterial(req, res) {
        try {
            const { id } = req.params;
            await prisma.studyMaterial.delete({ where: { id } });
            return sendSuccess(res, null, 'Material deleted successfully');
        } catch (error) {
            return sendError(res, error.message, 500);
        }
    }
}

module.exports = new StudyController();
