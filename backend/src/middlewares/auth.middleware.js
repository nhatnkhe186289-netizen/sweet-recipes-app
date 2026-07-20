const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/responseHandler');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return sendError(res, 'User not found', 404);
      }
      if (req.user.status === 'blocked') {
        return sendError(res, 'Tài khoản của bạn đã bị khóa bởi Quản trị viên.', 403);
      }
      next();
    } catch (error) {
      console.error(error);
      return sendError(res, 'Not authorized, token failed', 401);
    }
  }

  if (!token) {
    return sendError(res, 'Not authorized, no token', 401);
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return sendError(res, 'Không có quyền truy cập. Chỉ dành cho Quản trị viên.', 403);
  }
};

module.exports = { protect, adminOnly };
