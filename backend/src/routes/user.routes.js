const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

router.route('/profile')
  .get(protect, userController.getProfile)
  .put(protect, upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }]), userController.updateProfile);

router.get('/recipes', protect, userController.getUserRecipes);

router.get('/:id', protect, userController.getUserById);
router.post('/:id/follow', protect, userController.followUser);
router.post('/:id/unfollow', protect, userController.unfollowUser);

module.exports = router;
