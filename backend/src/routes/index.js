const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const recipeRoutes = require('./recipe.routes');
const categoryRoutes = require('./category.routes');
const userRoutes = require('./user.routes');
const favoriteRoutes = require('./favorite.routes');
const commentRoutes = require('./comment.routes');
<<<<<<< HEAD
const notificationRoutes = require('./notification.routes');
const shoppingListRoutes = require('./shoppingList.routes');
=======
const mealPlanRoutes = require('./mealPlan.routes');
const adminRoutes = require('./admin.routes');
>>>>>>> d428b3b853ed06f91ab51858676775879f8ff471

router.use('/auth', authRoutes);
router.use('/recipes', recipeRoutes);
router.use('/categories', categoryRoutes);
router.use('/users', userRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/comments', commentRoutes);
<<<<<<< HEAD
router.use('/notifications', notificationRoutes);
router.use('/shopping-list', shoppingListRoutes);
=======
router.use('/mealplans', mealPlanRoutes);
router.use('/admin', adminRoutes);
>>>>>>> d428b3b853ed06f91ab51858676775879f8ff471

module.exports = router;
