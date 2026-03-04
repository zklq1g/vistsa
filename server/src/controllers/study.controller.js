const { prisma } = require('../config');
const { sendSuccess, sendError } = require('../utils/response.utils');
const { sanitizeUrl } = require('../utils/url.utils');

class StudyController {
    // ── Public / Member: get only APPROVED materials ─────────────────────────
    async getMaterials(req, res) {
        try {
            const { category } = req.query;
            const where = {
                status: 'APPROVED',
                ...(category ? { category } : {})
            };

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

    // ── Member: submit resource for review (status = PENDING) ─────────────────
    async submitMaterial(req, res) {
        try {
            const { title, description, fileUrl, externalUrl, category } = req.body;

            if (!title || !category) {
                return sendError(res, 'Title and category are required', 400);
            }

            // Validate and sanitize URLs
            const cleanExternalUrl = externalUrl ? sanitizeUrl(externalUrl) : null;
            const cleanFileUrl = fileUrl ? sanitizeUrl(fileUrl) : null;

            if (externalUrl && !cleanExternalUrl) {
                return sendError(res, 'External URL is invalid or contains a disallowed protocol', 400);
            }
            if (fileUrl && !cleanFileUrl) {
                return sendError(res, 'File URL is invalid or contains a disallowed protocol', 400);
            }
            if (!cleanExternalUrl && !cleanFileUrl) {
                return sendError(res, 'At least one of External URL or File URL is required', 400);
            }

            const material = await prisma.studyMaterial.create({
                data: {
                    title,
                    description,
                    fileUrl: cleanFileUrl,
                    externalUrl: cleanExternalUrl,
                    category,
                    status: 'PENDING',
                    uploadedById: req.user.userId
                }
            });
            return sendSuccess(res, material, 'Resource submitted for review', 201);
        } catch (error) {
            return sendError(res, error.message, 500);
        }
    }

    // ── Admin: get all pending submissions ────────────────────────────────────
    async getPendingMaterials(req, res) {
        try {
            const materials = await prisma.studyMaterial.findMany({
                where: { status: 'PENDING' },
                orderBy: { createdAt: 'asc' },
                include: { uploadedBy: { select: { id: true, displayName: true, username: true } } }
            });
            return sendSuccess(res, materials, 'Pending materials fetched');
        } catch (error) {
            return sendError(res, error.message, 500);
        }
    }

    // ── Admin: approve a submission ───────────────────────────────────────────
    async approveMaterial(req, res) {
        try {
            const { id } = req.params;
            const material = await prisma.studyMaterial.update({
                where: { id },
                data: { status: 'APPROVED' }
            });
            return sendSuccess(res, material, 'Resource approved and published');
        } catch (error) {
            return sendError(res, error.message, 500);
        }
    }

    // ── Admin: reject a submission ────────────────────────────────────────────
    async rejectMaterial(req, res) {
        try {
            const { id } = req.params;
            const material = await prisma.studyMaterial.update({
                where: { id },
                data: { status: 'REJECTED' }
            });
            return sendSuccess(res, material, 'Resource rejected');
        } catch (error) {
            return sendError(res, error.message, 500);
        }
    }

    // ── Admin: direct upload (auto-approved) ──────────────────────────────────
    async uploadMaterial(req, res) {
        try {
            const { title, description, fileUrl, externalUrl, category } = req.body;

            if (!title || !category) {
                return sendError(res, 'Title and category are required', 400);
            }

            const cleanExternalUrl = externalUrl ? sanitizeUrl(externalUrl) : null;
            const cleanFileUrl = fileUrl ? sanitizeUrl(fileUrl) : null;

            if (externalUrl && !cleanExternalUrl) {
                return sendError(res, 'External URL is invalid or contains a disallowed protocol', 400);
            }
            if (fileUrl && !cleanFileUrl) {
                return sendError(res, 'File URL is invalid or contains a disallowed protocol', 400);
            }

            const material = await prisma.studyMaterial.create({
                data: {
                    title, description,
                    fileUrl: cleanFileUrl,
                    externalUrl: cleanExternalUrl,
                    category,
                    status: 'APPROVED', // Admin uploads are auto-approved
                    uploadedById: req.user.userId
                }
            });
            return sendSuccess(res, material, 'Material published successfully', 201);
        } catch (error) {
            return sendError(res, error.message, 500);
        }
    }

    // ── Admin: get ALL materials (all statuses) ────────────────────────────────
    async getAllMaterials(req, res) {
        try {
            const { status, category } = req.query;
            const where = {};
            if (status) where.status = status;
            if (category) where.category = category;

            const materials = await prisma.studyMaterial.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                include: { uploadedBy: { select: { id: true, displayName: true, username: true } } }
            });
            return sendSuccess(res, materials, 'Materials fetched');
        } catch (error) {
            return sendError(res, error.message, 500);
        }
    }

    // ── Admin / Member (own): delete material ────────────────────────────────
    async deleteMaterial(req, res) {
        try {
            const { id } = req.params;
            await prisma.studyMaterial.delete({ where: { id } });
            return sendSuccess(res, null, 'Material deleted successfully');
        } catch (error) {
            return sendError(res, error.message, 500);
        }
    }

    // ── Member: get their own submissions ────────────────────────────────────
    async getMySubmissions(req, res) {
        try {
            const materials = await prisma.studyMaterial.findMany({
                where: { uploadedById: req.user.userId },
                orderBy: { createdAt: 'desc' }
            });
            return sendSuccess(res, materials, 'Your submissions fetched');
        } catch (error) {
            return sendError(res, error.message, 500);
        }
    }
}

module.exports = new StudyController();
