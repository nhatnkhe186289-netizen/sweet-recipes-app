const User = require('../models/User');
const Recipe = require('../models/Recipe');
const { sendSuccess, sendError } = require('../utils/responseHandler');

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('createdRecipes')
      .populate('favoriteRecipes');
    return sendSuccess(res, user, 'User profile retrieved successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const updateProfile = async (req, res) => {
  try {
    const { username, bio, avatar } = req.body;
    const updateData = {};

    if (username) {
      const usernameExists = await User.findOne({ username, _id: { $ne: req.user._id } });
      if (usernameExists) {
        return sendError(res, 'Username is already taken', 400);
      }
      updateData.username = username;
    }

    if (bio !== undefined) {
      updateData.bio = bio;
    }

    if (avatar) {
      updateData.avatar = avatar;
    }

    if (req.file) {
      updateData.avatar = req.file.path;
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, { new: true })
      .select('-password');

    return sendSuccess(res, updatedUser, 'Profile updated successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

const getUserRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find({ author: req.user._id })
      .populate('category', 'name image');
    return sendSuccess(res, recipes, 'User recipes retrieved successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getUserRecipes,
};
