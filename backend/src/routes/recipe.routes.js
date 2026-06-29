const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipe.controller');
const { protect } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

router.route('/')
  .get(recipeController.getRecipes)
  .post(protect, upload.single('image'), recipeController.createRecipe);

router.route('/:id')
  .get(recipeController.getRecipeById)
  .put(protect, upload.single('image'), recipeController.updateRecipe)
  .delete(protect, recipeController.deleteRecipe);

module.exports = router;
