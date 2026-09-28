const userModel = require('../models/userModel');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');
const { isValidPassword } = require('../utils/validators');

const authController = {
  /**
   * Register a new user
   * POST /api/auth/register
   */
  async register(req, res, next) {
    try {
      const { name, email, password, age, monthlyIncome } = req.body;

      // Check duplicate email
      const existingUser = await userModel.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email address already exists.'
        });
      }

      // Hash password using bcrypt (Never store plain-text password)
      const password_hash = await hashPassword(password);

      const user = await userModel.create({
        name,
        email,
        password_hash,
        age,
        monthly_income: monthlyIncome
      });

      const token = generateToken({
        id: user.id,
        email: user.email,
        name: user.name
      });

      res.status(201).json({
        success: true,
        message: 'Account created successfully.',
        data: {
          token,
          user
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Login user
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await userModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.'
        });
      }

      // Compare password with bcrypt hash
      const isMatch = await comparePassword(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.'
        });
      }

      const token = generateToken({
        id: user.id,
        email: user.email,
        name: user.name
      });

      // Never return password_hash to client
      const { password_hash, ...safeUser } = user;

      res.status(200).json({
        success: true,
        message: 'Logged in successfully.',
        data: {
          token,
          user: safeUser
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get logged-in user profile
   * GET /api/auth/me
   */
  async getMe(req, res, next) {
    try {
      const user = await userModel.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found.'
        });
      }

      res.status(200).json({
        success: true,
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update profile information
   * PUT /api/auth/profile
   */
  async updateProfile(req, res, next) {
    try {
      const { name, age, monthly_income } = req.body;
      const updatedUser = await userModel.update(req.user.id, {
        name,
        age,
        monthly_income
      });

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found.'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully.',
        data: { user: updatedUser }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Change password
   * PUT /api/auth/change-password
   */
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password and new password are required.'
        });
      }

      if (!isValidPassword(newPassword)) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long.'
        });
      }

      // Fetch user with hash
      const user = await userModel.findByEmail(req.user.email);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      const isMatch = await comparePassword(currentPassword, user.password_hash);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Incorrect current password.'
        });
      }

      const newHash = await hashPassword(newPassword);
      await userModel.updatePassword(req.user.id, newHash);

      res.status(200).json({
        success: true,
        message: 'Password changed successfully.'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = authController;
