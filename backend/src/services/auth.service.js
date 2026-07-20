const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const registerUser = async (username, email, password) => {
  const userExists = await User.findOne({ $or: [{ email }, { username }] });
  if (userExists) {
    throw new Error('User already exists with this email or username');
  }

  const role = email.toLowerCase() === 'admin@sweetrecipes.com' ? 'admin' : 'user';

  const user = await User.create({
    username,
    email,
    password, // store in plaintext
    role,
  });

  return {
    _id: user._id,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
    status: user.status,
    token: generateToken(user._id),
  };
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  if (user.status === 'blocked') {
    throw new Error('Tài khoản của bạn đã bị khóa bởi Quản trị viên.');
  }

  // plaintext password match
  const isMatch = password === user.password;
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  return {
    _id: user._id,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
    status: user.status,
    token: generateToken(user._id),
  };
};

const forgotPassword = async (email, username, newPassword) => {
  const user = await User.findOne({ email, username });
  if (!user) {
    throw new Error('User with this email and username does not exist');
  }

  user.password = newPassword;
  await user.save();

  return {
    success: true,
    message: 'Password reset successfully',
  };
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const isMatch = currentPassword === user.password;
  if (!isMatch) {
    throw new Error('Incorrect current password');
  }

  user.password = newPassword;
  await user.save();

  return {
    success: true,
    message: 'Password changed successfully',
  };
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  changePassword,
};
