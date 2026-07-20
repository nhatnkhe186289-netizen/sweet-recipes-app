const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const recipeRoutes = require('./recipe.routes');
const categoryRoutes = require('./category.routes');
const userRoutes = require('./user.routes');
const favoriteRoutes = require('./favorite.routes');
const commentRoutes = require('./comment.routes');
const mealPlanRoutes = require('./mealPlan.routes');
const adminRoutes = require('./admin.routes');

router.use('/auth', authRoutes);
router.use('/recipes', recipeRoutes);
router.use('/categories', categoryRoutes);
router.use('/users', userRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/comments', commentRoutes);
router.use('/mealplans', mealPlanRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
