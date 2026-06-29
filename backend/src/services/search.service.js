const Recipe = require('../models/Recipe');

const searchRecipes = async (query, categoryId, difficulty) => {
  const filter = {};

  if (query) {
    filter.$or = [
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { ingredients: { $regex: query, $options: 'i' } },
    ];
  }

  if (categoryId) {
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
