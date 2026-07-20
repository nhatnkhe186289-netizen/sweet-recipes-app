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
    const { username, bio, avatar, coverImage } = req.body;
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

    if (coverImage) {
      updateData.coverImage = coverImage;
    }

    if (req.files) {
      if (req.files.avatar && req.files.avatar.length > 0) {
        updateData.avatar = req.files.avatar[0].path;
      }
      if (req.files.coverImage && req.files.coverImage.length > 0) {
        updateData.coverImage = req.files.coverImage[0].path;
      }
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

const followUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const userId = req.user._id;

    if (targetUserId === userId.toString()) {
      return sendError(res, 'You cannot follow yourself', 400);
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(userId);

    if (!targetUser) {
      return sendError(res, 'User not found', 404);
    }

    const isAlreadyFollowing = currentUser.following.some(id => id.toString() === targetUserId.toString());

    if (!isAlreadyFollowing) {
      currentUser.following.push(targetUserId);
      if (!targetUser.followers.some(id => id.toString() === userId.toString())) {
        targetUser.followers.push(userId);
      }
      await currentUser.save();
      await targetUser.save();

      // Create a notification
      const Notification = require('../models/Notification');
      await Notification.create({
        recipient: targetUserId,
        sender: userId,
        type: 'follow',
        content: `${currentUser.username} started following you.`,
      });
    }

    return sendSuccess(res, null, 'Successfully followed user');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const unfollowUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const userId = req.user._id;

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(userId);

    if (!targetUser) {
      return sendError(res, 'User not found', 404);
    }

    currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId);
    targetUser.followers = targetUser.followers.filter(id => id.toString() !== userId.toString());

    await currentUser.save();
    await targetUser.save();

    return sendSuccess(res, null, 'Successfully unfollowed user');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId)
      .select('-password -email')
      .lean();

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    const recipes = await Recipe.find({ author: userId })
      .populate('category', 'name image');

    user.recipes = recipes;

    return sendSuccess(res, user, 'User retrieved successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getUserRecipes,
  followUser,
  unfollowUser,
  getUserById,
};
