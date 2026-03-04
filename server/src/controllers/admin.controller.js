const bcrypt = require('bcrypt');
const userRepository = require('../repositories/user.repository');
const { sendSuccess, sendError } = require('../utils/response.utils');

class AdminController {
    async createUser(req, res) {
        try {
            const { username, displayName, password, role } = req.body;

            if (!username || !displayName || !password) {
                return sendError(res, 'Username, displayName, and password are required', 400);
            }

            const existingUser = await userRepository.findByUsername(username);
            if (existingUser) {
                return sendError(res, 'Username already exists', 409);
            }

            const hashedPassword = await bcrypt.hash(password, 12);

            const newUser = await userRepository.create({
                username,
                displayName,
                password: hashedPassword,
                role: role || 'MEMBER',
            });

            const { password: _, ...userWithoutPassword } = newUser;
            return sendSuccess(res, userWithoutPassword, 'User created successfully', 201);
        } catch (error) {
            return sendError(res, error.message, 500);
        }
    }

    async getAllUsers(req, res) {
        try {
            const users = await userRepository.findAll();
            return sendSuccess(res, users, 'Users fetched successfully');
        } catch (error) {
            return sendError(res, error.message, 500);
        }
    }

    async resetUserPassword(req, res) {
        try {
            const { id } = req.params;
            const { newPassword } = req.body;

            if (!newPassword) {
                return sendError(res, 'New password is required', 400);
            }

            const hashedPassword = await bcrypt.hash(newPassword, 12);
            await userRepository.update(id, { password: hashedPassword });

            return sendSuccess(res, null, 'Password reset successfully');
        } catch (error) {
            return sendError(res, error.message, 500);
        }
    }

    async toggleUserStatus(req, res) {
        try {
            const { id } = req.params;
            const targetUser = await userRepository.findById(id);
            if (!targetUser) return sendError(res, 'User not found', 404);

            // Hierarchy Protection:
            // 1. Nobody can disable a SYSTEM_ADMIN
            if (targetUser.role === 'SYSTEM_ADMIN') {
                return sendError(res, 'The System Admin account cannot be disabled.', 403);
            }

            // 2. Regular Admins cannot disable other ADMINS
            if (req.user.role === 'ADMIN' && targetUser.role === 'ADMIN') {
                return sendError(res, 'As a regular Admin, you do not have permission to disable another Admin.', 403);
            }

            await userRepository.update(id, { isActive: !targetUser.isActive });
            return sendSuccess(res, null, `User ${!targetUser.isActive ? 'enabled' : 'disabled'} successfully`);
        } catch (error) {
            return sendError(res, error.message, 500);
        }
    }

    async permanentlyDeleteUser(req, res) {
        try {
            const { id } = req.params;
            const targetUser = await userRepository.findById(id);
            if (!targetUser) return sendError(res, 'User not found', 404);

            // Hierarchy Protection:
            // 1. Nobody can delete a SYSTEM_ADMIN
            if (targetUser.role === 'SYSTEM_ADMIN') {
                return sendError(res, 'The System Admin account is permanent and cannot be deleted.', 403);
            }

            // 2. Regular Admins cannot delete other ADMINS
            if (req.user.role === 'ADMIN' && targetUser.role === 'ADMIN') {
                return sendError(res, 'As a regular Admin, you do not have permission to delete another Admin.', 403);
            }

            await userRepository.delete(id);
            return sendSuccess(res, null, 'User permanently deleted');
        } catch (error) {
            return sendError(res, error.message, 500);
        }
    }
}

module.exports = new AdminController();
