const authService = require('../services/auth.service');
const { sendSuccess, sendError } = require('../utils/responseHandler');

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return sendError(res, 'Please provide username, email and password', 400);
    }
    const result = await authService.registerUser(username, email, password);
    return sendSuccess(res, result, 'User registered successfully', 201);
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return sendError(res, 'Please provide email and password', 400);
    }
    const result = await authService.loginUser(email, password);
    return sendSuccess(res, result, 'Logged in successfully', 200);
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return sendError(res, 'Please provide email and new password', 400);
    }
    const result = await authService.resetPassword(email, newPassword);
    return sendSuccess(res, result, 'Password reset successfully', 200);
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return sendError(res, 'Please provide current and new password', 400);
    }
    const result = await authService.changePassword(req.user._id, currentPassword, newPassword);
    return sendSuccess(res, result, 'Password changed successfully', 200);
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

module.exports = {
  register,
  login,
  resetPassword,
  changePassword,
};
