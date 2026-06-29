const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { protect } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

router.route('/')
  .get(categoryController.getCategories)
  .post(protect, upload.single('image'), categoryController.createCategory);

module.exports = router;
