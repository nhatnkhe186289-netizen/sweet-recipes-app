const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const {
  logNutrition,
  getDailyNutrition,
  getWeeklyNutrition,
  deleteNutritionLog,
  updateCalorieGoal,
} = require('../controllers/nutrition.controller');

router.post('/', protect, logNutrition);
router.get('/daily', protect, getDailyNutrition);
router.get('/weekly', protect, getWeeklyNutrition);
router.delete('/:id', protect, deleteNutritionLog);
router.put('/goal', protect, updateCalorieGoal);

module.exports = router;
