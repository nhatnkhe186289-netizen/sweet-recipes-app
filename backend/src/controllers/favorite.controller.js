const Favorite = require('../models/Favorite');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/responseHandler');

const getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ userId: req.user._id })
      .populate({
        path: 'recipeId',
        populate: [
          { path: 'author', select: 'username avatar' },
          { path: 'category', select: 'name image' }
        ]
      });
    
    // Return array of recipes that are favorited
    const favoriteRecipes = favorites
      .filter(f => f.recipeId)
      .map(f => f.recipeId);

    return sendSuccess(res, favoriteRecipes, 'Favorites retrieved successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const addFavorite = async (req, res) => {
  try {
    const { recipeId } = req.body;
    if (!recipeId) {
      return sendError(res, 'Recipe ID is required', 400);
    }

    let favorite = await Favorite.findOne({ userId: req.user._id, recipeId });
    if (favorite) {
      return sendError(res, 'Recipe is already favorited', 400);
    }

    favorite = await Favorite.create({
      userId: req.user._id,
      recipeId,
    });

    // Add to User's favoriteRecipes array as well
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { favoriteRecipes: recipeId },
    });

    return sendSuccess(res, favorite, 'Added to favorites successfully', 201);
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

const removeFavorite = async (req, res) => {
  try {
    const { recipeId } = req.params;
    if (!recipeId) {
      return sendError(res, 'Recipe ID is required', 400);
    }

    const favorite = await Favorite.findOneAndDelete({ userId: req.user._id, recipeId });
    if (!favorite) {
      return sendError(res, 'Favorite not found', 404);
    }

    // Remove from User's favoriteRecipes array
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { favoriteRecipes: recipeId },
    });

    return sendSuccess(res, null, 'Removed from favorites successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

module.exports = {
  getFavorites,
  addFavorite,
  removeFavorite,
};
