const bcrypt = require('bcrypt');
const userRepository = require('../repositories/user.repository');
const { sendSuccess, sendError } = require('../utils/response.utils');

class AdminController {
  async createUser(req, res) {
    try {
      const { username, displayName, password, role } = req.body;
      const requesterRole = req.user.role;

      if (!username || !displayName || !password) {
        return sendError(res, 'Username, displayName, and password are required', 400);
      }

      let assignedRole = role || 'MEMBER';
      if (requesterRole === 'MOD' && assignedRole !== 'MEMBER') {
        return sendError(res, 'Moderators can only create Member accounts', 403);
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
        role: assignedRole,
      });

      const { password: _, ...userWithoutPassword } = newUser;
      return sendSuccess(res, userWithoutPassword, 'User created successfully', 201);
    } catch (error) {
      return sendError(res, error.message, 500);
    }
  }

  async getAllUsers(req, res) {
    try {
      const requesterRole = req.user.role;
      let filter = {};

      if (requesterRole === 'MOD') {
        filter = { role: 'MEMBER' };
      }

      const users = await userRepository.findAll(filter);
      return sendSuccess(res, users, 'Users fetched successfully');
    } catch (error) {
      return sendError(res, error.message, 500);
    }
  }

  async resetUserPassword(req, res) {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;
      const requesterRole = req.user.role;

      if (!newPassword) {
        return sendError(res, 'New password is required', 400);
      }

      const targetUser = await userRepository.findById(id);
      if (!targetUser) return sendError(res, 'User not found', 404);

      if (requesterRole === 'MOD' && targetUser.role !== 'MEMBER') {
        return sendError(res, 'Moderators can only manage Members', 403);
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
      const requesterRole = req.user.role;

      const user = await userRepository.findById(id);
      if (!user) return sendError(res, 'User not found', 404);

      if (requesterRole === 'MOD' && user.role !== 'MEMBER') {
        return sendError(res, 'Moderators can only manage Members', 403);
      }

      if (req.user.userId === id) {
        return sendError(res, 'You cannot disable your own account', 400);
      }

      await userRepository.update(id, { isActive: !user.isActive });
      return sendSuccess(res, null, `User ${!user.isActive ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      return sendError(res, error.message, 500);
    }
  }

  async permanentlyDeleteUser(req, res) {
    try {
      const { id } = req.params;
      if (req.user.role !== 'ADMIN') {
        return sendError(res, 'Only System Admins can delete users', 403);
      }

      await userRepository.delete(id);
      return sendSuccess(res, null, 'User permanently deleted');
    } catch (error) {
      return sendError(res, error.message, 500);
    }
  }
}

module.exports = new AdminController();
