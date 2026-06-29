const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

router.route('/profile')
  .get(protect, userController.getProfile)
  .put(protect, upload.single('avatar'), userController.updateProfile);

router.get('/recipes', protect, userController.getUserRecipes);

module.exports = router;
