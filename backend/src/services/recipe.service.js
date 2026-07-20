const Recipe = require('../models/Recipe');
const User = require('../models/User');
const Favorite = require('../models/Favorite');

const createRecipe = async (recipeData, authorId) => {
  const recipe = await Recipe.create({
    ...recipeData,
    author: authorId,
  });

  // Add recipe reference to User's createdRecipes list
  await User.findByIdAndUpdate(authorId, {
    $push: { createdRecipes: recipe._id },
  });

  return recipe;
};

const getRecipes = async (filter = {}) => {
  // If not explicitly querying all or setting status, default to 'approved'
  const queryFilter = { status: 'approved', ...filter };
  return await Recipe.find(queryFilter)
    .populate('author', 'username avatar')
    .populate('category', 'name image')
    .sort({ createdAt: -1 });
};

const getRecipeById = async (recipeId, currentUser = null) => {
  const recipe = await Recipe.findById(recipeId)
    .populate('author', 'username avatar')
    .populate('category', 'name image');

  if (!recipe) {
    throw new Error('Recipe not found');
  }

  // If recipe is not approved, check if current user is author or admin
  if (recipe.status !== 'approved') {
    if (!currentUser) {
      throw new Error('Not authorized to view this recipe');
    }
    const isAuthor = recipe.author && recipe.author._id.toString() === currentUser._id.toString();
    const isAdmin = currentUser.role === 'admin';
    if (!isAuthor && !isAdmin) {
      throw new Error('Not authorized to view this recipe');
    }
  }

  return recipe;
};

const updateRecipe = async (recipeId, updateData, userId) => {
  const recipe = await Recipe.findById(recipeId);
  if (!recipe) {
    throw new Error('Recipe not found');
  }

  if (recipe.author.toString() !== userId.toString()) {
    throw new Error('Not authorized to edit this recipe');
  }

  return await Recipe.findByIdAndUpdate(recipeId, updateData, { new: true });
};

const deleteRecipe = async (recipeId, userId) => {
  const recipe = await Recipe.findById(recipeId);
  if (!recipe) {
    throw new Error('Recipe not found');
  }

  if (recipe.author.toString() !== userId.toString()) {
    throw new Error('Not authorized to delete this recipe');
  }

  await Recipe.findByIdAndDelete(recipeId);

  // Remove recipe reference from User's createdRecipes list
  await User.findByIdAndUpdate(userId, {
    $pull: { createdRecipes: recipeId },
  });

  // Clean up all Favorite entries & pull from all users' favoriteRecipes
  await Favorite.deleteMany({ recipeId });
  await User.updateMany(
    { favoriteRecipes: recipeId },
    { $pull: { favoriteRecipes: recipeId } }
  );

  return { message: 'Recipe removed successfully' };
};

module.exports = {
  createRecipe,
  getRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
};
