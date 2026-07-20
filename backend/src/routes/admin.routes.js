const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { protect, adminOnly } = require('../middlewares/auth.middleware');

// Protect all admin routes
router.use(protect);
router.use(adminOnly);

// User moderation routes
router.route('/users')
  .get(adminController.getAllUsers);

router.route('/users/:id/role')
  .put(adminController.updateUserRole);

router.route('/users/:id/status')
  .put(adminController.updateUserStatus);

router.route('/users/:id')
  .delete(adminController.deleteUser);

// Recipe moderation routes
router.route('/recipes')
  .get(adminController.getAllRecipesAdmin);

router.route('/recipes/:id/status')
  .put(adminController.updateRecipeStatus);

module.exports = router;
