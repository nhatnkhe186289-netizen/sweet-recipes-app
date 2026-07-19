const ShoppingList = require('../models/ShoppingList');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// @desc    Get user shopping list
// @route   GET /api/shopping-list
// @access  Private
const getShoppingList = async (req, res) => {
  try {
    const items = await ShoppingList.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return sendSuccess(res, items, 'Fetched shopping list successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// @desc    Add item(s) to shopping list
// @route   POST /api/shopping-list
// @access  Private
const addShoppingListItems = async (req, res) => {
  try {
    const { items, name, amount, recipeTitle } = req.body;

    // Bulk add from recipe ingredients
    if (items && Array.isArray(items)) {
      const newItems = items.map(item => ({
        userId: req.user._id,
        name: typeof item === 'string' ? item : item.name,
        amount: typeof item === 'object' ? (item.amount || '') : '',
        recipeTitle: recipeTitle || '',
      }));
      const saved = await ShoppingList.insertMany(newItems);
      return sendSuccess(res, saved, 'Added items from recipe to shopping list', 201);
    }

    // Single item add
    if (!name) {
      return sendError(res, 'Item name is required', 400);
    }

    const newItem = await ShoppingList.create({
      userId: req.user._id,
      name,
      amount: amount || '',
      recipeTitle: recipeTitle || '',
    });

    return sendSuccess(res, newItem, 'Added item to shopping list', 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// @desc    Toggle item bought status
// @route   PUT /api/shopping-list/:id/toggle
// @access  Private
const toggleBought = async (req, res) => {
  try {
    const item = await ShoppingList.findOne({ _id: req.params.id, userId: req.user._id });
    if (!item) {
      return sendError(res, 'Shopping list item not found', 404);
    }

    item.isBought = !item.isBought;
    await item.save();

    return sendSuccess(res, item, 'Updated item status');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// @desc    Delete item from shopping list
// @route   DELETE /api/shopping-list/:id
// @access  Private
const deleteShoppingListItem = async (req, res) => {
  try {
    const item = await ShoppingList.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!item) {
      return sendError(res, 'Item not found', 404);
    }
    return sendSuccess(res, null, 'Deleted item from shopping list');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// @desc    Clear all items in shopping list
// @route   DELETE /api/shopping-list
// @access  Private
const clearShoppingList = async (req, res) => {
  try {
    await ShoppingList.deleteMany({ userId: req.user._id });
    return sendSuccess(res, null, 'Cleared shopping list');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

module.exports = {
  getShoppingList,
  addShoppingListItems,
  toggleBought,
  deleteShoppingListItem,
  clearShoppingList,
};
