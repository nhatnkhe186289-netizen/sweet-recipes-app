const Recipe = require('../models/Recipe');
const mongoose = require('mongoose');

const searchRecipes = async (query, categoryId, difficulty) => {
  const filter = { status: 'approved' };

  if (query) {
    filter.$or = [
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { ingredients: { $regex: query, $options: 'i' } },
    ];
  }

  if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
    filter.category = categoryId;
  }

  if (difficulty) {
    filter.difficulty = difficulty;
  }

  return await Recipe.find(filter)
    .populate('author', 'username avatar')
    .populate('category', 'name image');
};

module.exports = {
  searchRecipes,
};
