const User = require('../models/User');
const Recipe = require('../models/Recipe');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// 1. User Account Management
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }) // Exclude self
      .select('-password')
      .sort({ createdAt: -1 });
    return sendSuccess(res, users, 'Users retrieved successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!role || !['user', 'admin'].includes(role)) {
      return sendError(res, 'Vai trò không hợp lệ', 400);
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    user.role = role;
    await user.save();

    return sendSuccess(res, { _id: user._id, role: user.role }, 'User role updated successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !['active', 'blocked'].includes(status)) {
      return sendError(res, 'Trạng thái không hợp lệ', 400);
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    user.status = status;
    await user.save();

    return sendSuccess(res, { _id: user._id, status: user.status }, 'User status updated successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Delete user recipes too
    await Recipe.deleteMany({ author: user._id });
    await User.findByIdAndDelete(req.params.id);

    return sendSuccess(res, null, 'User and their recipes deleted successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

// 2. Recipe Moderation
const getAllRecipesAdmin = async (req, res) => {
  try {
    const recipes = await Recipe.find({})
      .populate('author', 'username email avatar')
      .populate('category', 'name image')
      .sort({ createdAt: -1 });
    return sendSuccess(res, recipes, 'All recipes retrieved successfully for admin');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const updateRecipeStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return sendError(res, 'Trạng thái kiểm duyệt không hợp lệ', 400);
    }

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return sendError(res, 'Recipe not found', 404);
    }

    recipe.status = status;
    await recipe.save();

    return sendSuccess(res, recipe, 'Recipe moderation status updated successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

module.exports = {
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  getAllRecipesAdmin,
  updateRecipeStatus,
};
