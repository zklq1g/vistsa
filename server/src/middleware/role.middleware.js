const { sendError } = require('../utils/response.utils');

const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return sendError(res, 'Unauthorized', 401);
        }

        if (!allowedRoles.includes(req.user.role)) {
            return sendError(res, 'Forbidden: Insufficient permissions', 403);
        }

        next();
    };
};

// Convenience exports
const requireAdmin = requireRole(['ADMIN']);
const requireMember = requireRole(['MEMBER', 'ADMIN']);

module.exports = { requireRole, requireAdmin, requireMember };
