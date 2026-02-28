const bcrypt = require('bcrypt');
const userRepository = require('../repositories/user.repository');
const { generateToken } = require('../utils/jwt.utils');

class AuthService {
    async login(username, password) {
        const user = await userRepository.findByUsername(username);
        if (!user) {
            throw new Error('Invalid credentials');
        }

        if (!user.isActive) {
            throw new Error('Account disabled');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }

        // Exclude password from the response
        const { password: _, ...userWithoutPassword } = user;

        const token = generateToken({
            userId: user.id,
            username: user.username,
            role: user.role,
        });

        return { token, user: userWithoutPassword };
    }
}

module.exports = new AuthService();
