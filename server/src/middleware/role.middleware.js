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
const requireMod = requireRole(['ADMIN', 'MOD']);
const requireMember = requireRole(['MEMBER', 'MOD', 'ADMIN']);

module.exports = { requireRole, requireAdmin, requireMod, requireMember };
