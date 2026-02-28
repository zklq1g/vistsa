const { verifyToken } = require('../utils/jwt.utils');
const { sendError } = require('../utils/response.utils');

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return sendError(res, 'Authentication required', 401);
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);

        req.user = decoded; // { userId, username, role }
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return sendError(res, 'Token expired', 401);
        }
        return sendError(res, 'Invalid token', 401);
    }
};

module.exports = authMiddleware;
