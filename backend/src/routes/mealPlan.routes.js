const express = require('express');
const router = express.Router();
const mealPlanController = require('../controllers/mealPlan.controller');
const { protect } = require('../middlewares/auth.middleware');

router.route('/')
  .get(protect, mealPlanController.getMealPlans)
  .post(protect, mealPlanController.createMealPlan);

router.route('/:id')
  .delete(protect, mealPlanController.deleteMealPlan);

module.exports = router;
