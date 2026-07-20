const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: 'https://res.cloudinary.com/demo/image/upload/v1622523942/sample.jpg',
  },
  coverImage: {
    type: String,
    default: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800',
  },
  bio: {
    type: String,
    default: 'Đam mê làm bánh ngọt truyền thống.',
  },
  createdRecipes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
  }],
  favoriteRecipes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
  }],
<<<<<<< HEAD
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
=======
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  status: {
    type: String,
    enum: ['active', 'blocked'],
    default: 'active',
  },
>>>>>>> d428b3b853ed06f91ab51858676775879f8ff471
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', UserSchema);
