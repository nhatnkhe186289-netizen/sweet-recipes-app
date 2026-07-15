const mongoose = require('mongoose');

const NutritionLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recipe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
  },
  recipeTitle: {
    type: String,
    required: true,
    trim: true,
  },
  calories: {
    type: Number,
    required: true,
  },
  mealType: {
    type: String,
    enum: ['Sáng', 'Trưa', 'Tối', 'Ăn vặt'],
    default: 'Ăn vặt',
  },
  date: {
    type: Date,
    default: Date.now,
  },
  dayString: {
    type: String,
    required: true, // Format: 'YYYY-MM-DD'
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('NutritionLog', NutritionLogSchema);
