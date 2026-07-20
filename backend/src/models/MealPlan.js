const mongoose = require('mongoose');

const MealPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recipe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
    required: true,
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true,
  },
  time: {
    type: String, // Format: HH:MM (e.g. 15:30)
    required: true,
  }
}, {
  timestamps: true, // Automatically manages createdAt and updatedAt
});

module.exports = mongoose.model('MealPlan', MealPlanSchema);
