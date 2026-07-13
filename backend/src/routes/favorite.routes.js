const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favorite.controller');
const { protect } = require('../middlewares/auth.middleware');

router.route('/')
  .get(protect, favoriteController.getFavorites)
  .post(protect, favoriteController.addFavorite);

router.delete('/all', protect, favoriteController.clearFavorites);

router.route('/:recipeId')
  .delete(protect, favoriteController.removeFavorite);

module.exports = router;
