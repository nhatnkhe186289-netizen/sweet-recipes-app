const MealPlan = require('../models/MealPlan');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// @desc    Get all meal plans for user
// @route   GET /api/mealplans
// @access  Private
const getMealPlans = async (req, res) => {
  try {
    const plans = await MealPlan.find({ user: req.user._id })
      .populate({
        path: 'recipe',
        populate: [
          { path: 'author', select: 'username avatar' },
          { path: 'category', select: 'name image' }
        ]
      })
      .sort({ date: 1 });

    return sendSuccess(res, plans, 'Meal plans retrieved successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// @desc    Create a meal plan
// @route   POST /api/mealplans
// @access  Private
const createMealPlan = async (req, res) => {
  try {
    const { recipeId, date, time } = req.body;

    if (!recipeId || !date || !time) {
      return sendError(res, 'Recipe ID, date, and time are required', 400);
    }

    const plan = await MealPlan.create({
      user: req.user._id,
      recipe: recipeId,
      date,
      time
    });

    // Populate recipe info for immediate frontend use
    const populatedPlan = await MealPlan.findById(plan._id).populate({
      path: 'recipe',
      populate: [
        { path: 'author', select: 'username avatar' },
        { path: 'category', select: 'name image' }
      ]
    });

    return sendSuccess(res, populatedPlan, 'Meal plan created successfully', 201);
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

// @desc    Delete a meal plan
// @route   DELETE /api/mealplans/:id
// @access  Private
const deleteMealPlan = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await MealPlan.findOneAndDelete({ _id: id, user: req.user._id });

    if (!plan) {
      return sendError(res, 'Meal plan not found or unauthorized', 404);
    }

    return sendSuccess(res, null, 'Meal plan deleted successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

module.exports = {
  getMealPlans,
  createMealPlan,
  deleteMealPlan
};
