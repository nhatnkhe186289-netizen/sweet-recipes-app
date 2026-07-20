const recipeService = require('../services/recipe.service');
const searchService = require('../services/search.service');
const { sendSuccess, sendError } = require('../utils/responseHandler');

const createRecipe = async (req, res) => {
  try {
    const { title, description, category, ingredients, instructions, cookingTime, calories, difficulty } = req.body;
    let image = '';

    if (req.file) {
      image = req.file.path; // Cloudinary image URL
    } else if (req.body.image) {
      image = req.body.image;
    } else {
      return sendError(res, 'Hình ảnh công thức là bắt buộc', 400);
    }

    if (!title || !description || !category || !ingredients || !instructions || !cookingTime || !calories) {
      return sendError(res, 'Vui lòng điền đầy đủ các thông tin bắt buộc', 400);
    }

    // Parse ingredients & instructions if they are sent as JSON strings from React Native
    const parsedIngredients = typeof ingredients === 'string' ? JSON.parse(ingredients) : ingredients;
    const parsedInstructions = typeof instructions === 'string' ? JSON.parse(instructions) : instructions;

    // Helper to map English or undefined difficulty to Vietnamese enum
    const mapDifficulty = (diff) => {
      if (diff === 'Easy') return 'Dễ';
      if (diff === 'Medium') return 'Trung bình';
      if (diff === 'Hard') return 'Khó';
      return diff || 'Dễ';
    };

    const recipeData = {
      title,
      description,
      image,
      category,
      ingredients: parsedIngredients,
      instructions: parsedInstructions,
      cookingTime: Number(cookingTime),
      calories: Number(calories),
      difficulty: mapDifficulty(difficulty),
    };

    const recipe = await recipeService.createRecipe(recipeData, req.user._id);
    return sendSuccess(res, recipe, 'Recipe created successfully', 201);
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

const getRecipes = async (req, res) => {
  try {
    const { category, difficulty, query } = req.query;
    let recipes;

    if (query || category || difficulty) {
      recipes = await searchService.searchRecipes(query, category, difficulty);
    } else {
      recipes = await recipeService.getRecipes();
    }

    return sendSuccess(res, recipes, 'Recipes retrieved successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const getRecipeById = async (req, res) => {
  try {
    const recipe = await recipeService.getRecipeById(req.params.id);
    return sendSuccess(res, recipe, 'Recipe retrieved successfully');
  } catch (error) {
    return sendError(res, error.message, 404);
  }
};

const updateRecipe = async (req, res) => {
  try {
    const { title, description, category, ingredients, instructions, cookingTime, calories, difficulty } = req.body;
    const updateData = {};

    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (category) updateData.category = category;
    if (cookingTime) updateData.cookingTime = Number(cookingTime);
    if (calories) updateData.calories = Number(calories);
    if (difficulty) {
      if (difficulty === 'Easy') updateData.difficulty = 'Dễ';
      else if (difficulty === 'Medium') updateData.difficulty = 'Trung bình';
      else if (difficulty === 'Hard') updateData.difficulty = 'Khó';
      else updateData.difficulty = difficulty;
    }

    if (ingredients) {
      updateData.ingredients = typeof ingredients === 'string' ? JSON.parse(ingredients) : ingredients;
    }
    if (instructions) {
      updateData.instructions = typeof instructions === 'string' ? JSON.parse(instructions) : instructions;
    }

    if (req.file) {
      updateData.image = req.file.path;
    } else if (req.body.image) {
      updateData.image = req.body.image;
    }

    const updatedRecipe = await recipeService.updateRecipe(req.params.id, updateData, req.user._id);
    return sendSuccess(res, updatedRecipe, 'Recipe updated successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

const deleteRecipe = async (req, res) => {
  try {
    const result = await recipeService.deleteRecipe(req.params.id, req.user._id);
    return sendSuccess(res, null, result.message);
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

module.exports = {
  createRecipe,
  getRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
};
