const { prisma } = require('../config');
const { sendSuccess, sendError } = require('../utils/response.utils');

// ─── URL Validation Utility ───────────────────────────────────────────────────
const validateUrl = (url) => {
    if (!url) return true; // Optional field — skip if empty
    try {
        const trimmed = url.trim();
        const parsed = new URL(trimmed);
        // Only allow safe schemes
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            return false;
        }
        return true;
    } catch {
        return false;
    }
};

const sanitizeUrl = (url) => (url ? url.trim() : url);

class StudyController {
    // ── GET: Members see only APPROVED. Admins see everything (with optional filter) ──
    async getMaterials(req, res) {
        try {
            const { category, status } = req.query;
            const isAdmin = req.user?.role === 'ADMIN';

            const where = {};
            if (category) where.category = category;

            if (isAdmin) {
                // Admins can filter by status, or see all
                if (status) where.status = status;
            } else {
                // Members see all approved resources OR their own submissions
                where.OR = [
                    { status: 'APPROVED' },
                    { uploadedById: req.user.userId }
                ];
            }

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

    // ── MEMBER: Submit resource for admin approval ────────────────────────────
    async submitMaterial(req, res) {
        try {
            const { title, description, fileUrl, externalUrl, category } = req.body;

            if (!title || !category) {
                return sendError(res, 'Title and category are required', 400);
            }
            if (!externalUrl && !fileUrl) {
                return sendError(res, 'You must provide at least one URL (external or file)', 400);
            }

            // Validate URLs
            const cleanExternal = sanitizeUrl(externalUrl);
            const cleanFile = sanitizeUrl(fileUrl);

            if (cleanExternal && !validateUrl(cleanExternal)) {
                return sendError(res, 'External URL must be a valid http:// or https:// link', 400);
            }
            if (cleanFile && !validateUrl(cleanFile)) {
                return sendError(res, 'File URL must be a valid http:// or https:// link', 400);
            }

            const material = await prisma.studyMaterial.create({
                data: {
                    title: title.trim(),
                    description: description?.trim(),
                    fileUrl: cleanFile || null,
                    externalUrl: cleanExternal || null,
                    category,
                    status: 'PENDING',
                    uploadedById: req.user.userId
                }
            });
            return sendSuccess(res, material, 'Resource submitted for admin approval', 201);
        } catch (error) {
            return sendError(res, error.message, 500);
        }
    }

    // ── ADMIN: Upload resource directly (auto-approved) ───────────────────────
    async uploadMaterial(req, res) {
        try {
            const { title, description, fileUrl, externalUrl, category } = req.body;

            if (!title || !category) {
                return sendError(res, 'Title and category are required', 400);
            }

            const cleanExternal = sanitizeUrl(externalUrl);
            const cleanFile = sanitizeUrl(fileUrl);

            if (cleanExternal && !validateUrl(cleanExternal)) {
                return sendError(res, 'External URL must be a valid http:// or https:// link', 400);
            }
            if (cleanFile && !validateUrl(cleanFile)) {
                return sendError(res, 'File URL must be a valid http:// or https:// link', 400);
            }

            const material = await prisma.studyMaterial.create({
                data: {
                    title: title.trim(),
                    description: description?.trim(),
                    fileUrl: cleanFile || null,
                    externalUrl: cleanExternal || null,
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

    // ── ADMIN: Approve a pending submission ───────────────────────────────────
    async approveMaterial(req, res) {
        try {
            const { id } = req.params;
            const material = await prisma.studyMaterial.update({
                where: { id },
                data: { status: 'APPROVED', rejectionReason: null }
            });
            return sendSuccess(res, material, 'Resource approved and published');
        } catch (error) {
            return sendError(res, error.message, 500);
        }
    }

    // ── ADMIN: Reject a pending submission ────────────────────────────────────
    async rejectMaterial(req, res) {
        try {
            const { id } = req.params;
            const { reason } = req.body;
            const material = await prisma.studyMaterial.update({
                where: { id },
                data: {
                    status: 'REJECTED',
                    rejectionReason: reason?.trim() || 'Does not meet submission guidelines.'
                }
            });
            return sendSuccess(res, material, 'Resource rejected');
        } catch (error) {
            return sendError(res, error.message, 500);
        }
    }

    // ── ADMIN: Delete a resource ──────────────────────────────────────────────
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
