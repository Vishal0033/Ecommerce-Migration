import { userRepository } from '../repositories/userRepository.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';
import { AppError } from '../utils/appError.js';

export const authService = {
  register: async ({ name, email, password, role }) => {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new AppError('An account with this email address already exists.', 409);
    }

    const hashedPassword = await hashPassword(password);
    const userRole = role && role === 'ADMIN' ? 'ADMIN' : 'USER';

    const user = await userRepository.create({
      name,
      email,
      password: hashedPassword,
      role: userRole,
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return { user, token };
  },

  login: async ({ email, password }) => {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password.', 401);
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      throw new AppError('Invalid email or password.', 401);
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    };

    return { user: safeUser, token };
  },

  getCurrentUser: async (userId) => {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found.', 404);
    }
    return user;
  },
};

