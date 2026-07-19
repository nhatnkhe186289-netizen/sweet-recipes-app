const mongoose = require('mongoose');

const ShoppingListSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  amount: {
    type: String,
    default: '',
    trim: true,
  },
  recipeTitle: {
    type: String,
    default: '',
  },
  isBought: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('ShoppingList', ShoppingListSchema);
