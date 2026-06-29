const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comment.controller');
const { protect } = require('../middlewares/auth.middleware');

router.route('/')
  .post(protect, commentController.addComment);

router.route('/:recipeId')
  .get(commentController.getRecipeComments);

router.route('/:id')
  .delete(protect, commentController.deleteComment);

module.exports = router;
