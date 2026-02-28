const authService = require('../services/auth.service');
const { sendSuccess, sendError } = require('../utils/response.utils');

class AuthController {
    async login(req, res) {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return sendError(res, 'Username and password are required', 400);
            }

            const data = await authService.login(username, password);
            return sendSuccess(res, data, 'Login successful');
        } catch (error) {
            return sendError(res, error.message, 401);
        }
    }

    async me(req, res) {
        try {
            // req.user is hydrated by auth.middleware
            return sendSuccess(res, { user: req.user }, 'Current user data fetched');
        } catch (error) {
            return sendError(res, 'Error fetching user data', 500);
        }
    }
}

module.exports = new AuthController();
