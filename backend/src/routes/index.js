const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const recipeRoutes = require('./recipe.routes');
const categoryRoutes = require('./category.routes');
const userRoutes = require('./user.routes');
const favoriteRoutes = require('./favorite.routes');
const commentRoutes = require('./comment.routes');
const notificationRoutes = require('./notification.routes');
const nutritionRoutes = require('./nutrition.routes');

router.use('/auth', authRoutes);
router.use('/recipes', recipeRoutes);
router.use('/categories', categoryRoutes);
router.use('/users', userRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/comments', commentRoutes);
router.use('/notifications', notificationRoutes);
router.use('/nutrition', nutritionRoutes);

module.exports = router;
